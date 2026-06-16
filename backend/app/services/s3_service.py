import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_file_to_cloudinary(file):

    result = cloudinary.uploader.upload(
        file,
        resource_type="auto",
        folder="secure_files"
    )

    print("RESOURCE TYPE:", result.get("resource_type"))
    print("FORMAT:", result.get("format"))
    print("URL:", result.get("secure_url"))

    return result["secure_url"]