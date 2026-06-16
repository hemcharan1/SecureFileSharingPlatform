from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Folder, User, File
from app.schemas import FolderCreate
from app.auth import get_current_user

router = APIRouter()


@router.post("/folders")
def create_folder(
    folder: FolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_folder = Folder(
        name=folder.name,
        owner_id=current_user.id
    )

    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)

    return new_folder


@router.get("/folders")
def get_folders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    folders = db.query(Folder).filter(
        Folder.owner_id == current_user.id
    ).all()

    return [
        {
            "id": folder.id,
            "name": folder.name,
            "file_count": len(folder.files)
        }
        for folder in folders
    ]


@router.get("/folders/{folder_id}/files")
def get_folder_files(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    files = db.query(File).filter(
        File.folder_id == folder_id,
        File.owner_id == current_user.id
    ).all()

    return files


@router.put("/folders/{folder_id}")
def rename_folder(
    folder_id: int,
    folder: FolderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()

    if not existing_folder:
        return {
            "message": "Folder not found"
        }

    existing_folder.name = folder.name

    db.commit()

    return {
        "message": "Folder renamed"
    }


@router.delete("/folders/{folder_id}")
def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.owner_id == current_user.id
    ).first()

    if not folder:
        return {
            "message": "Folder not found"
        }

    db.delete(folder)

    db.commit()

    return {
        "message": "Folder deleted"
    }