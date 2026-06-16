import { useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/api";
import { toast } from "react-toastify";

function Upload() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select a file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      const response = await API.post(
        "/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);

      toast.success(
        "File Uploaded Successfully"
      );

      setFile(null);
    } catch (error) {
      console.log(error);

      setMessage("Upload Failed");

      toast.error(
        "Upload Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar />

      <div className="page-container">
        <div className="upload-card">
          <div className="upload-page">
          <h1>Upload File</h1>

          <div
            className={
              dragActive
                ? "drop-zone active"
                : "drop-zone"
            }
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              className="file-input"
              type="file"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
            />

            <h2>📁 Drag & Drop Files Here</h2>

            <p>Click to browse files</p>

            {file && (
              <h4>
                Selected: {file.name}
              </h4>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>

          <p>{message}</p>
        </div>
      </div>
    </div>
    </>
  );
}

export default Upload;