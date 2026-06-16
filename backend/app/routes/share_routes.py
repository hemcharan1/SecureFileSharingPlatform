from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, File, SharedFile
from app.auth import get_current_user

router = APIRouter()

@router.post("/share-file/{file_id}")
def share_file(
    file_id: int,
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    file = db.query(File).filter(
        File.id == file_id
    ).first()

    if not file:
        return {"message": "File not found"}

    if file.owner_id != current_user.id:
        return {"message": "Access denied"}

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return {"message": "User not found"}

    shared = SharedFile(
        file_id=file.id,
        shared_with_user_id=user.id
    )

    db.add(shared)
    db.commit()

    return {"message": "File shared successfully"}
@router.get("/shared-files")
def get_shared_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    shared = db.query(
        SharedFile
    ).filter(
        SharedFile.shared_with_user_id
        == current_user.id
    ).all()

    return [
        {
            "id": item.file.id,
            "filename": item.file.filename,
            "filepath": item.file.filepath
        }
        for item in shared
    ]