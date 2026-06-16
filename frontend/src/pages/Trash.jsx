import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

function Trash() {
  const [files, setFiles] = useState([]);

  const fetchTrash = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/trash", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFiles(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const restoreFile = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await API.put(
        `/restore/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTrash();
    } catch (error) {
      console.log(error);
    }
  };

  const permanentDelete = async (id) => {
    const token = localStorage.getItem("token");

    await API.delete(`/permanent-delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchTrash();
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">

        <div className="trash-page">

          <h1>🗑️ Trash</h1>

          <div className="trash-grid">

            {files.map(file => (

              <div
                className="trash-card"
                key={file.id}
              >

                <div className="trash-file-name">
                  📄 {file.filename}
                </div>

                <div className="trash-actions">

                  <button
                    className="restore-btn"
                    onClick={() => restoreFile(file.id)}
                  >
                    Restore
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => permanentDelete(file.id)}
                  >
                    Delete Forever
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>
    </div>
  );
}

export default Trash;