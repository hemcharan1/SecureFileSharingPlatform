import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/api";

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/my-files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFiles(response.data);

      const folderResponse = await API.get("/folders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFolders(folderResponse.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const toggleFavorite = async (fileId) => {
    const token = localStorage.getItem("token");

    try {
      await API.put(
        `/favorite/${fileId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchFiles();
    } catch (error) {
      console.log(error);
    }
  };

  const moveToTrash = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await API.put(
        `/move-to-trash/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchFiles();
    } catch (error) {
      console.log(error);
    }
  };

  const moveFile = async (fileId, folderId) => {

    console.log("FILE ID:", fileId);
    console.log("FOLDER ID:", folderId);

    if (!folderId) return;

    const token = localStorage.getItem("token");

    try {

      const response = await API.put(
        `/files/${fileId}/move/${folderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      fetchFiles();

    } catch (error) {
      console.log(error);
    }
  };

  const generateLink = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.put(
        `/generate-temp-link/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fullLink =
        `${window.location.origin}${response.data.public_url}`;

      navigator.clipboard.writeText(fullLink);

      alert(`Copied To Clipboard:\n${fullLink}`);

      navigator.clipboard.writeText(response.data.public_url);

      alert(`Link copied!\n\n${response.data.public_url}`);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ ADDED FUNCTION (ONLY CHANGE)
  const shareFile = async (fileId) => {

    const email = prompt("Enter Email");

    if(!email) return;

    const token = localStorage.getItem("token");

    try{

      const response = await API.post(
        `/share-file/${fileId}?email=${email}`,
        {},
        {
          headers:{
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(response.data.message);

    }catch(error){
      console.log(error);
    }
  };

  const getFileIcon = (filename) => {
    const name = filename.toLowerCase();

    if (name.endsWith(".pdf")) return "📄";

    if (
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".png")
    ) {
      return "🖼️";
    }

    if (name.endsWith(".mp4") || name.endsWith(".avi")) {
      return "🎥";
    }

    if (name.endsWith(".doc") || name.endsWith(".docx")) {
      return "📝";
    }

    return "📁";
  };

  const openPreview = (file) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const filteredFiles = files
    .filter((file) => {
      const matchesSearch = file.filename
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === "all") return true;

      if (filter === "favorites") {
        return file.is_favorite;
      }

      if (filter === "public") {
        return file.visibility === "public";
      }

      if (filter === "private") {
        return file.visibility === "private";
      }

      if (filter === "pdf") {
        return file.filename.toLowerCase().endsWith(".pdf");
      }

      if (filter === "image") {
        return (
          file.filename.toLowerCase().endsWith(".jpg") ||
          file.filename.toLowerCase().endsWith(".jpeg") ||
          file.filename.toLowerCase().endsWith(".png")
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "az") {
        return a.filename.localeCompare(b.filename);
      }

      if (sortBy === "za") {
        return b.filename.localeCompare(a.filename);
      }

      if (sortBy === "largest") {
        return (b.file_size || 0) - (a.file_size || 0);
      }

      if (sortBy === "smallest") {
        return (a.file_size || 0) - (b.file_size || 0);
      }

      return b.id - a.id;
    });

  return (
    <>
      <Sidebar />

      <div className="files-page">
        <h1>My Files ({files.length})</h1>

        <input
          className="search-box"
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <div className="file-toolbar">
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
          >
            <option value="all">All Files</option>
            <option value="pdf">PDF</option>
            <option value="image">Images</option>
            <option value="favorites">Favorites</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
          >
            <option value="newest">Newest</option>
            <option value="az">Name A-Z</option>
            <option value="za">Name Z-A</option>
            <option value="largest">Largest</option>
            <option value="smallest">Smallest</option>
          </select>
        </div>

        <div className="files-grid">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="file-card"
            >
              <h3
                style={{ cursor: "pointer" }}
                onClick={() =>
                  openPreview(file)
                }
              >
                {getFileIcon(file.filename)}{" "}
                {file.filename}
              </h3>

              <div
                className={
                  file.visibility ===
                  "public"
                    ? "badge public"
                    : "badge private"
                }
              >
                {file.visibility}
              </div>

              <div className="actions">
                <button
                  onClick={() =>
                    toggleFavorite(file.id)
                  }
                >
                  {file.is_favorite
                    ? "⭐"
                    : "☆"}
                </button>

                <a
                  href={file.filepath}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>

                <button
                  onClick={() =>
                    makePublic(file.id)
                  }
                >
                  Public
                </button>

                <button
                  onClick={() =>
                    generateLink(file.id)
                  }
                >
                  Temp Link
                </button>

                {/* ✅ ONLY ADDITION */}
                <button
                  onClick={() =>
                    shareFile(file.id)
                  }
                >
                  Share
                </button>

                <button
                  onClick={() =>
                    moveToTrash(file.id)
                  }
                >
                  🗑️ Move To Trash
                </button>

                <select
                  onChange={(e) =>
                    moveFile(
                      file.id,
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Move To Folder
                  </option>

                  {folders.map((folder) => (
                    <option
                      key={folder.id}
                      value={folder.id}
                    >
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
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

export default MyFiles;