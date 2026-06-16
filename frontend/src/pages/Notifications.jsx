import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");

      const response = await API.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(response.data);
    };

    fetchNotifications();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">

        <div className="notifications-page">

          <h1>
            🔔 Notifications
          </h1>

          {notifications.map((n) => (
            <div key={n.id} className="notification-card">
              {n.message}
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default Notifications;