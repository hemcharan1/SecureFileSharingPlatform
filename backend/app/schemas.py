from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
class FileResponse(BaseModel):
    id: int
    filename: str
    filepath: str
    owner_id: int
    visibility: str
    is_favorite: bool

    class Config:
        from_attributes = True

class FolderCreate(BaseModel):
    name: str