from fastapi import FastAPI
from .database import engine
from .models import Base
from .routes import user_routes
from .routes import file_routes
from app.routes.file_routes import router as file_router
from dotenv import load_dotenv
load_dotenv()
import os
from fastapi.middleware.cors import CORSMiddleware
from app.routes import folder_routes
from app.routes import share_routes
print("API KEY:", os.getenv("CLOUDINARY_API_KEY"))

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://secure-file-sharing-platform-alpha.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes.router)
app.include_router(file_routes.router)
app.include_router(folder_routes.router)
app.include_router(share_routes.router)
@app.get("/")
def home():
    return {
        "message": "Secure File Sharing Platform API Running"
    }