import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <h2>SecureShare</h2>
        <Link to="/about">ℹ About</Link>

        <Link to="/dashboard">Dashboard</Link>

        <Link to="/upload">Upload</Link>

        <Link to="/my-files">My Files</Link>

        <Link to="/folders">📂 Folders</Link>

        <Link to="/shared-files">Shared Files</Link>

        <Link to="/audit-logs">Audit Logs</Link>

        <Link to="/profile">👤 Profile</Link>

        <Link to="/notifications">🔔 Notifications</Link>

        <Link to="/trash">🗑️ Trash</Link>
      </div>

        <button onClick={logout}>
          Logout
        </button>
    </div>
  );
}

export default Sidebar;