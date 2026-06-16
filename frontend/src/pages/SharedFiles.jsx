import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/api";

function SharedFiles() {

  const [files, setFiles] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {

    const fetchSharedFiles = async () => {

      try {

        const response = await API.get(
          "/shared-with-me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setFiles(response.data);

      } catch (error) {

        console.log(error);

      }

    };

    fetchSharedFiles();

  }, []);

  return (
    <>
      <Sidebar />

      <div className="files-page">

        <h1>Shared With Me</h1>

        <div className="files-grid">
      <div className="shared-page">

          {files.map((file) => (

            <div
              key={file.file_id}
              className="file-card"
            >

              <h3>{file.filename}</h3>

              <a
                href={file.file_url}
                target="_blank"
                rel="noreferrer"
              >
                Open File
              </a>

            </div>

          ))}

        </div>
      </div>

      </div>
    </>
  );
}

export default SharedFiles;