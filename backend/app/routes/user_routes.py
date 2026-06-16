from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from app.models import File, Folder, SharedFile
from app.services.s3_service import upload_file_to_cloudinary
from ..schemas import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token
)

from ..utils.security import (
    hash_password,
    verify_password
)

from ..auth import (
    create_access_token,
    get_current_user
)

from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse
)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ✅ OAuth2 Login Route
@router.post(
    "/login",
    response_model=Token
)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email or password"
        )

    if not verify_password(
        form_data.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# ✅ /me Route
@router.get("/me")
def get_logged_in_user(
    current_user: User = Depends(get_current_user)
):

    return {
        "username": current_user.username,
        "email": current_user.email,
        "profile_pic": current_user.profile_pic
    }


# ✅ Profile Route
@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    files_count = db.query(File).filter(
        File.owner_id == current_user.id
    ).count()

    folders_count = db.query(Folder).filter(
        Folder.owner_id == current_user.id
    ).count()

    favorites_count = db.query(File).filter(
        File.owner_id == current_user.id,
        File.is_favorite == True
    ).count()

    return {
        "username": current_user.username,
        "email": current_user.email,
        "profile_pic": current_user.profile_pic,
        "files": files_count,
        "folders": folders_count,
        "favorites": favorites_count
    }


# ✅ Upload Profile Picture
@router.post("/upload-profile-pic")
def upload_profile_pic(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    image_url = upload_file_to_cloudinary(
        file.file
    )

    current_user.profile_pic = image_url

    db.commit()

    return {
        "profile_pic": image_url
    }
@router.delete("/delete-profile-pic")
def delete_profile_pic(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.profile_pic = None
    db.commit()

    return {
        "message":"Deleted"
    }