import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";
import ImageCropper from "../components/ImageCropper";

function Profile() {
  const [profile, setProfile] = useState(null);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [showCropper, setShowCropper] =
    useState(false);

  const uploadImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(
      URL.createObjectURL(file)
    );

    setShowCropper(true);
  };

  const saveCroppedImage =
    async (
      imageSrc,
      crop
    ) => {

      const image =
        new Image();

      image.src = imageSrc;

      image.onload =
        async () => {

          const canvas =
            document.createElement(
              "canvas"
            );

          const ctx =
            canvas.getContext("2d");

          canvas.width =
            crop.width;

          canvas.height =
            crop.height;

          ctx.drawImage(
            image,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            crop.width,
            crop.height
          );

          canvas.toBlob(
            async (blob) => {

              const formData =
                new FormData();

              formData.append(
                "file",
                blob,
                "profile.jpg"
              );

              const token =
                localStorage.getItem(
                  "token"
                );

              await API.post(
                "/upload-profile-pic",
                formData,
                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`
                  }
                }
              );

              window.location.reload();

            },
            "image/jpeg"
          );
        };
    };

  const deleteProfilePic = async () => {
    try {
      const token = localStorage.getItem("token");

      await API.delete("/delete-profile-pic", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      const response = await API.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">

        {showCropper && (
          <ImageCropper
            image={selectedImage}
            onClose={() =>
              setShowCropper(false)
            }
            onSave={saveCroppedImage}
          />
        )}

        <div className="profile-page">
          <h1>👤 Profile</h1>

          <div className="profile-card">
            <div className="profile-header">
              {profile.profile_pic ? (
                <>
                  <img
                    src={profile.profile_pic}
                    alt="Profile"
                    className="profile-avatar"
                  />

                  <button
                    className="delete-profile-btn"
                    onClick={deleteProfilePic}
                  >
                    🗑 Remove Photo
                  </button>

                  <label className="upload-avatar-btn">
                    📷 Change Photo
                    <input
                      type="file"
                      hidden
                      onChange={uploadImage}
                    />
                  </label>
                </>
              ) : (
                <>
                  <div className="profile-avatar">
                    👤
                  </div>

                  <label className="upload-avatar-btn">
                    📷 Change Photo
                    <input
                      type="file"
                      hidden
                      onChange={uploadImage}
                    />
                  </label>
                </>
              )}

              <div>
                <h2>{profile.username}</h2>
                <p>{profile.email}</p>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-box">
                <h3>{profile.files}</h3>
                <p>Files</p>
              </div>

              <div className="stat-box">
                <h3>{profile.folders}</h3>
                <p>Folders</p>
              </div>

              <div className="stat-box">
                <h3>{profile.favorites}</h3>
                <p>Favorites</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;