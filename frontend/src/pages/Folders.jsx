import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

function Folders() {

  const [folders, setFolders] = useState([]);
  const [folderName, setFolderName] = useState("");

  const navigate = useNavigate();

  const fetchFolders = async () => {

    const token =
      localStorage.getItem("token");

    const response =
      await API.get("/folders", {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      });

    setFolders(response.data);
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const createFolder = async () => {

    if (!folderName.trim()) {
      alert("Enter folder name");
      return;
    }

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await API.post(
          "/folders",
          {
            name: folderName,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(response.data);

      setFolderName("");

      await fetchFolders();

      alert("Folder Created Successfully");

    } catch (error) {

      console.log(error);

    }
  };

  const renameFolder = async (
    id,
    currentName
  ) => {

    const newName =
      prompt(
        "Enter new folder name",
        currentName
      );

    if (!newName) return;

    const token =
      localStorage.getItem("token");

    await API.put(
      `/folders/${id}`,
      {
        name: newName
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    fetchFolders();
  };

  const deleteFolder = async (
    id
  ) => {

    if (
      !window.confirm(
        "Delete folder?"
      )
    ) return;

    const token =
      localStorage.getItem("token");

    await API.delete(
      `/folders/${id}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

    fetchFolders();
  };

  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-content">

        <div className="folders-page">

          <h1>📂 My Folders</h1>

          <div className="folder-create">

            <input
              type="text"
              placeholder="Folder Name"
              value={folderName}
              onChange={(e) => {

                console.log(e.target.value);

                setFolderName(e.target.value);

              }}
            />

            <button
              onClick={createFolder}
            >
              Create Folder
            </button>

          </div>

          <div className="folder-grid">

            {folders.map(folder => (

              <div
                className="folder-card"
                key={folder.id}
                onClick={() =>
                  navigate(`/folder/${folder.id}`)
                }
              >

                <h3>
                  📁 {folder.name}
                </h3>

                <p>
                  {folder.file_count} Files
                </p>

                <button
                  onClick={(e) => {

                    e.stopPropagation();

                    renameFolder(
                      folder.id,
                      folder.name
                    );

                  }}
                >
                  ✏ Rename
                </button>

                <button
                  onClick={(e) => {

                    e.stopPropagation();

                    deleteFolder(
                      folder.id
                    );

                  }}
                >
                  🗑 Delete
                </button>

                <p>
                  Folder ID: {folder.id}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Folders;