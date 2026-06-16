import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API from "../api/api";

function FolderFiles() {

  const { id } = useParams();

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const openPreview = (file) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const uploadToFolder = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const token =
      localStorage.getItem("token");

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    await API.post(
      `/upload?folder_id=${id}`,
      formData,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    window.location.reload();
  };

  useEffect(() => {

    const fetchFiles = async () => {

      const token =
        localStorage.getItem("token");

      const response =
        await API.get(
          `/folders/${id}/files`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setFiles(response.data);
    };

    fetchFiles();

  }, [id]);

  return (
    <>
      <Sidebar />

      <div className="files-page">

        <h1>📁 Folder Files</h1>

        <label
          className="upload-folder-btn"
        >
          📤 Upload Into Folder

          <input
            type="file"
            hidden
            onChange={uploadToFolder}
          />
        </label>

        <div className="files-grid">

          {files.map(file => (

            <div
              key={file.id}
              className="file-card"
            >

              <h3
                style={{
                  cursor: "pointer"
                }}
                onClick={() =>
                  openPreview(file)
                }
              >
                📄 {file.filename}
              </h3>

              <a
                href={file.filepath}
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>

            </div>

          ))}

        </div>

      </div>

      {showPreview &&
        selectedFile && (

          <div className="preview-overlay">

            <div className="preview-modal">

              <h2>
                {selectedFile.filename}
              </h2>

              {selectedFile.filepath.match(
                /\.(jpg|jpeg|png|gif)$/i
              ) ? (

                <img
                  src={selectedFile.filepath}
                  alt="preview"
                  className="preview-image"
                />

              ) : (

                <iframe
                  src={selectedFile.filepath}
                  title="preview"
                  className="preview-frame"
                />

              )}

              <button
                onClick={() =>
                  setShowPreview(false)
                }
              >
                Close
              </button>

            </div>

          </div>

        )}

    </>
  );
}

export default FolderFiles;