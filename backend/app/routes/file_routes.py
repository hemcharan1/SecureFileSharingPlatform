from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from ..models import File as FileModel, User
from ..models import SharedFile
from ..models import AuditLog
from ..models import Notification
from ..auth import get_current_user
from ..schemas import FileResponse as FileSchemaResponse

from ..services.s3_service import upload_file_to_cloudinary
from app.models import Folder

router = APIRouter()


# =========================
# 📝 AUDIT LOG HELPER
# =========================
def create_audit_log(db, user_email, action):

    log = AuditLog(
        user_email=user_email,
        action=action
    )

    db.add(log)
    db.commit()


# =========================
# 🔔 NOTIFICATION HELPER
# =========================
def create_notification(db, user_id, message):

    notification = Notification(
        user_id=user_id,
        message=message
    )

    db.add(notification)
    db.commit()


@router.post("/upload")
def upload_file(
    folder_id: int = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    print("Filename:", file.filename)
    print("Content Type:", file.content_type)

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    file_url = upload_file_to_cloudinary(file.file)

    new_file = FileModel(
        filename=file.filename,
        filepath=file_url,
        owner_id=current_user.id,
        file_size=file_size,
        folder_id=folder_id,
    )

    db.add(new_file)
    db.commit()

    # ✅ Upload Logging
    create_audit_log(
        db,
        current_user.email,
        f"Uploaded file: {file.filename}"
    )

    # 🔔 Notification ADDED
    create_notification(
        db,
        current_user.id,
        f"Uploaded file: {file.filename}"
    )

    db.refresh(new_file)

    return {
        "message": "File uploaded successfully",
        "file_url": file_url
    }


@router.get(
    "/my-files",
    response_model=List[FileSchemaResponse]
)
def get_my_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    files = db.query(FileModel).filter(
        FileModel.owner_id == current_user.id,
        FileModel.is_deleted == False
    ).all()

    return files


@router.get("/download/{file_id}")
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {"error": "File not found"}

    if file.owner_id == current_user.id:

        create_audit_log(
            db,
            current_user.email,
            f"Downloaded file: {file.filename}"
        )

        return {
            "filename": file.filename,
            "file_url": file.filepath
        }

    if file.visibility == "public":

        create_audit_log(
            db,
            current_user.email,
            f"Downloaded public file: {file.filename}"
        )

        return {
            "filename": file.filename,
            "file_url": file.filepath
        }

    shared = db.query(SharedFile).filter(
        SharedFile.file_id == file_id,
        SharedFile.shared_with_user_id == current_user.id
    ).first()

    if shared:

        create_audit_log(
            db,
            current_user.email,
            f"Downloaded shared file: {file.filename}"
        )

        return {
            "filename": file.filename,
            "file_url": file.filepath
        }

    return {"error": "Access denied"}


@router.delete("/delete/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {"error": "File not found"}

    if file.owner_id != current_user.id:
        return {"error": "Access denied"}

    db.delete(file)
    db.commit()

    create_audit_log(
        db,
        current_user.email,
        f"Deleted file: {file.filename}"
    )

    # 🔔 Notification ADDED
    create_notification(
        db,
        current_user.id,
        f"Deleted file: {file.filename}"
    )

    return {
        "message": "File deleted successfully"
    }


# =========================
# ✅ MAKE FILE PUBLIC
# =========================
@router.put("/make-public/{file_id}")
def make_file_public(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {"error": "File not found"}

    if file.owner_id != current_user.id:
        return {"error": "Access denied"}

    file.visibility = "public"

    db.commit()

    return {
        "message": "File is now public"
    }


# =========================
# 🌐 PUBLIC FILE ACCESS
# =========================
@router.get("/public-file/{file_id}")
def access_public_file(
    file_id: int,
    db: Session = Depends(get_db)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {"error": "File not found"}

    if file.visibility != "public":
        return {"error": "This file is private"}

    if file.expires_at:

        expiry_time = datetime.fromisoformat(file.expires_at)

        if datetime.utcnow() > expiry_time:
            return {"error": "This link has expired"}

    return {
        "filename": file.filename,
        "file_url": file.filepath
    }


# =========================
# 🔗 SHARE FILE WITH USER
# =========================
@router.post("/share-file/{file_id}/{user_id}")
def share_file_with_user(
    file_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {"error": "File not found"}

    if file.owner_id != current_user.id:
        return {"error": "Access denied"}

    shared_entry = SharedFile(
        file_id=file_id,
        shared_with_user_id=user_id
    )

    db.add(shared_entry)
    db.commit()

    create_audit_log(
        db,
        current_user.email,
        f"Shared file ID {file_id} with user ID {user_id}"
    )

    return {
        "message": f"File shared with user {user_id}"
    }


# =========================
# ⏳ GENERATE TEMP LINK
# =========================
@router.put("/generate-temp-link/{file_id}")
def generate_temp_link(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {"error": "File not found"}

    if file.owner_id != current_user.id:
        return {"error": "Access denied"}

    expiry_time = datetime.utcnow() + timedelta(minutes=10)

    file.visibility = "public"
    file.expires_at = expiry_time.isoformat()

    db.commit()

    return {
        "message": "Temporary public link generated",
        "expires_at": file.expires_at,
        "public_url": f"http://127.0.0.1:8000/public-file/{file.id}"
    }


# =========================
# 📂 SHARED WITH ME
# =========================
@router.get("/shared-with-me")
def get_shared_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    shared_files = db.query(SharedFile).filter(
        SharedFile.shared_with_user_id == current_user.id
    ).all()

    result = []

    for shared in shared_files:

        file = db.query(FileModel).filter(
            FileModel.id == shared.file_id
        ).first()

        if file:
            result.append({
                "file_id": file.id,
                "filename": file.filename,
                "file_url": file.filepath
            })

    return result


# =========================
# 📂 MOVE FILE TO FOLDER
# =========================
@router.put("/files/{file_id}/move/{folder_id}")
def move_file_to_folder(
    file_id: int,
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {"message": "File not found"}

    if file.owner_id != current_user.id:
        return {"message": "Access denied"}

    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()

    if not folder:
        return {
            "message": f"Folder {folder_id} not found for user {current_user.id}"
        }

    file.folder_id = folder_id
    db.commit()

    create_audit_log(
        db,
        current_user.email,
        f"Moved file '{file.filename}' to folder ID {folder_id}"
    )

    return {"message": "File moved successfully"}


@router.get("/folders/{folder_id}/files")
def get_folder_files(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    files = db.query(FileModel).filter(
        FileModel.folder_id == folder_id
    ).all()

    return files


# =========================
# ⭐ FAVORITE (FIRST VERSION)
# =========================
@router.put("/favorite/{file_id}")
def toggle_favorite(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {"message": "File not found"}

    file.is_favorite = not file.is_favorite
    db.commit()

    # 🔔 Notification ADDED
    create_notification(
        db,
        current_user.id,
        f"Updated favorite: {file.filename}"
    )

    return {
        "message": "Updated",
        "favorite": file.is_favorite
    }


# =========================
# 📊 DASHBOARD STATISTICS
# =========================
@router.get("/dashboard-stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    total_files = db.query(FileModel).filter(
        FileModel.owner_id == current_user.id
    ).count()

    public_files = db.query(FileModel).filter(
        FileModel.owner_id == current_user.id,
        FileModel.visibility == "public"
    ).count()

    shared_files = db.query(SharedFile).filter(
        SharedFile.shared_with_user_id == current_user.id
    ).count()

    audit_logs = db.query(AuditLog).filter(
        AuditLog.user_email == current_user.email
    ).count()
    total_storage = 1024 * 1024 * 1024  # 1GB

    used_storage = db.query(
        func.sum(FileModel.file_size)
    ).filter(
        FileModel.owner_id == current_user.id,
        FileModel.is_deleted == False
    ).scalar() or 0

    remaining_storage = total_storage - used_storage

    storage_percent = round(
        (used_storage / total_storage) * 100,
        2
    )

    return {
        "total_files": total_files,
        "public_files": public_files,
        "shared_files": shared_files,
        "audit_logs": audit_logs,
        "used_storage": used_storage,
        "remaining_storage": remaining_storage,
        "storage_percent": storage_percent
    }


# =========================
# 📜 VIEW AUDIT LOGS
# =========================
@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    logs = db.query(AuditLog).all()

    return logs


@router.get("/recent-activity")
def recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    logs = (
        db.query(AuditLog)
        .filter(AuditLog.user_email == current_user.email)
        .order_by(AuditLog.id.desc())
        .limit(5)
        .all()
    )

    return logs


# =========================
# 🔔 NOTIFICATIONS API
# =========================
@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.id.desc()).all()

    return notifications


# =========================
# ⭐ FAVORITE (SECOND VERSION - KEPT ORIGINAL)
# =========================
@router.put("/favorite/{file_id}")
def toggle_favorite_duplicate(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {"message": "File not found"}

    file.is_favorite = not file.is_favorite
    db.commit()

    # 🔔 Notification ADDED
    create_notification(
        db,
        current_user.id,
        f"Updated favorite: {file.filename}"
    )

    return {
        "message": "Favorite Updated"
    }
@router.put("/move-to-trash/{file_id}")
def move_to_trash(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {
            "message": "File not found"
        }

    file.is_deleted = True

    db.commit()

    create_notification(
        db,
        current_user.id,
        f"Moved {file.filename} to Trash"
    )

    return {
        "message": "Moved to Trash"
    }
@router.get("/trash")
def get_trash(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    files = db.query(FileModel).filter(
        FileModel.owner_id == current_user.id,
        FileModel.is_deleted == True
    ).all()

    return files
@router.put("/restore/{file_id}")
def restore_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {
            "message":"Not found"
        }

    file.is_deleted = False

    db.commit()

    return {
        "message":"Restored"
    }
@router.delete("/permanent-delete/{file_id}")
def permanent_delete(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {
            "message":"Not found"
        }

    db.delete(file)
    db.commit()

    return {
        "message":"Deleted permanently"
    }
@router.get("/search")
def search_files(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    files = db.query(FileModel).filter(
        FileModel.owner_id == current_user.id,
        FileModel.filename.ilike(f"%{query}%"),
        FileModel.is_deleted == False
    ).all()

    return files
@router.get("/storage-usage")
@router.get("/storage-usage")
def storage_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    files = db.query(FileModel).filter(
        FileModel.owner_id == current_user.id,
        FileModel.is_deleted == False
    ).all()

    total_bytes = sum(
        file.file_size or 0
        for file in files
    )

    used_mb = round(
        total_bytes / (1024 * 1024),
        2
    )

    max_storage = 1024

    remaining_storage = round(
        max_storage - used_mb,
        2
    )

    percentage = round(
        (used_mb / max_storage) * 100,
        2
    )

    return {
        "used_storage": used_mb,
        "remaining_storage":
            remaining_storage,
        "max_storage":
            max_storage,
        "percentage":
            percentage
    }
@router.put("/move-file/{file_id}/{folder_id}")
def move_file(
    file_id: int,
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(FileModel).filter(
        FileModel.id == file_id
    ).first()

    if not file:
        return {
            "message": "File not found"
        }

    file.folder_id = folder_id

    db.commit()

    return {
        "message": "File moved"
    }