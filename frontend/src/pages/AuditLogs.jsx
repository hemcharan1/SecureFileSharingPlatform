import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/api";

function AuditLogs() {

  const [logs, setLogs] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {

    const fetchLogs = async () => {

      try {

        const response = await API.get(
          "/audit-logs",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setLogs(response.data);

      } catch (error) {

        console.log(error);

      }

    };

    fetchLogs();

  }, []);

  return (
    <>
      <Sidebar />

      <div className="files-page">

        <h1>Audit Logs</h1>

        {logs.map((log) => (

          <div
            key={log.id}
            className="file-card"
            style={{
              marginBottom:"15px"
            }}
          >
            <p>
              <strong>
                {log.user_email}
              </strong>
            </p>

            <p>
              {log.action}
            </p>
          </div>

        ))}

      </div>
    </>
  );
}

export default AuditLogs;