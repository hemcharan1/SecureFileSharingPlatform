import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api/api";
import "./Dashboard.css";
import SearchBar from "../components/SearchBar";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState({
    total_files: 0,
    public_files: 0,
    shared_files: 0,
    audit_logs: 0,
    favorite_files: 0,
    total_folders: 0
  });

  const [activities, setActivities] = useState([]);
  const [user, setUser] = useState({});
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await API.get("/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data);

        const activityResponse = await API.get("/recent-activity", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setActivities(activityResponse.data);

        const userResponse = await API.get("/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(userResponse.data);

        const storageResponse = await API.get("/storage-usage", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStorage(storageResponse.data);

      } catch (error) {
        console.log(error);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  const pieData = [
    { name: "Files", value: stats.total_files || 0 },
    { name: "Public", value: stats.public_files || 0 },
    { name: "Shared", value: stats.shared_files || 0 }
  ];

  const barData = [
    { name: "Files", value: stats.total_files || 0 },
    { name: "Public", value: stats.public_files || 0 },
    { name: "Shared", value: stats.shared_files || 0 },
    { name: "Audit", value: stats.audit_logs || 0 }
  ];

  return (
    <>
      <Sidebar />

      <div className="dashboard-content">
        <h1>Dashboard</h1>

        <SearchBar />

        <div className="welcome-card">
          <h2>Welcome, {user.username} 👋</h2>
          <p>Secure File Sharing Platform</p>
        </div>

        <div className="cards">
          <div className="card">
            <h2>{stats.total_files}</h2>
            <p>Total Files</p>
          </div>

          <div className="card">
            <h2>{stats.public_files}</h2>
            <p>Public Files</p>
          </div>

          <div className="card">
            <h2>{stats.shared_files}</h2>
            <p>Shared Files</p>
          </div>

          <div className="card">
            <h2>{stats.audit_logs}</h2>
            <p>Audit Activities</p>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>

          {activities.length === 0 ? (
            <p>No recent activity found.</p>
          ) : (
            activities.map((item) => (
              <div key={item.id} className="activity-item">
                {item.action}
              </div>
            ))
          )}
        </div>

        {storage && (
          <div className="storage-card">
            <h2>💾 Storage Usage</h2>

            <p>
              Used:
              {(stats.used_storage / 1024 / 1024).toFixed(2)}
              MB
            </p>

            <p>
              Remaining:
              {(stats.remaining_storage / 1024 / 1024).toFixed(2)}
              MB
            </p>

            <p>Limit: 1024 MB</p>

            <div className="storage-bar">
              <div
                className="storage-fill"
                style={{
                  width: `${stats.storage_percent}%`
                }}
              />
            </div>

            <span>{stats.storage_percent}% Used</span>
          </div>
        )}

        {storage && (
          <div className="analytics-card">
            <h2>📊 Storage Analytics</h2>

            <PieChart width={350} height={250}>
              <Pie
                data={[
                  {
                    name: "Used",
                    value: stats.used_storage || 0
                  },
                  {
                    name: "Free",
                    value: stats.remaining_storage || 0
                  }
                ]}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                <Cell fill="#4f8cff" />
                <Cell fill="#1e3a8a" />
              </Pie>

              <Tooltip />
            </PieChart>
          </div>
        )}

        <div className="charts-container">

          <div className="chart-card">
            <h2>📊 File Analytics</h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

          </div>

          <div className="chart-card">
            <h2>📈 Activity Analytics</h2>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>

      </div>
    </>
  );
}

export default Dashboard;