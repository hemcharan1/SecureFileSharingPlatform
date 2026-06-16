from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, index=True)

    email = Column(String, unique=True, index=True)

    password = Column(String)

    profile_pic = Column(String, nullable=True)

    # Relationships
    files = relationship(
        "File",
        back_populates="owner"
    )

    shared_files = relationship(
        "SharedFile",
        back_populates="shared_with_user"
    )

    folders = relationship(
        "Folder",
        back_populates="owner"
    )


# =========================
# 📁 FOLDER MODEL
# =========================
class Folder(Base):
    __tablename__ = "folders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    owner_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    owner = relationship(
        "User",
        back_populates="folders"
    )

    files = relationship(
        "File",
        back_populates="folder"
    )


# =========================
# 📂 FILE MODEL
# =========================
class File(Base):
    __tablename__ = "files"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    filename = Column(String)

    filepath = Column(String)

    visibility = Column(
        String,
        default="private"
    )

    # ⭐ FAVORITE FEATURE
    is_favorite = Column(
        Boolean,
        default=False
    )

    # 💾 FILE SIZE
    file_size = Column(
        Integer,
        default=0
    )

    expires_at = Column(
        String,
        nullable=True
    )

    owner_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    folder_id = Column(
        Integer,
        ForeignKey("folders.id"),
        nullable=True
    )

    # Soft delete
    is_deleted = Column(
        Boolean,
        default=False
    )

    # Relationships
    owner = relationship(
        "User",
        back_populates="files"
    )

    folder = relationship(
        "Folder",
        back_populates="files"
    )

    shared_users = relationship(
        "SharedFile",
        back_populates="file"
    )


# =========================
# 🔗 SHARED FILE MODEL
# =========================
class SharedFile(Base):
    __tablename__ = "shared_files"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    file_id = Column(
        Integer,
        ForeignKey("files.id")
    )

    shared_with_user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    file = relationship(
        "File",
        back_populates="shared_users"
    )

    shared_with_user = relationship(
        "User",
        back_populates="shared_files"
    )


# =========================
# 📜 AUDIT LOG MODEL
# =========================
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_email = Column(String)

    action = Column(String)


# =========================
# 🔔 NOTIFICATION MODEL
# =========================
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    message = Column(String)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    is_read = Column(
        Boolean,
        default=False
    )