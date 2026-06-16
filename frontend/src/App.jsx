import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MyFiles from "./pages/MyFiles";
import SharedFiles from "./pages/SharedFiles";
import AuditLogs from "./pages/AuditLogs";
import FolderFiles from "./pages/FolderFiles";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import Folders from "./pages/Folders";
import FolderDetails
from "./pages/FolderDetails";
import Profile from "./pages/Profile";
import Notifications
from "./pages/Notifications";
import Trash
from "./pages/Trash";

import "./styles/global.css";
function App() {

  return (
    <BrowserRouter>

      <Routes>
        <Route
        path="/about"
        element={<About />}
        />

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-files"
          element={
            <ProtectedRoute>
              <MyFiles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shared-files"
          element={
            <ProtectedRoute>
              <SharedFiles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/folders" 
          element={<Folders />} 
        />
        <Route
          path="/folder/:id"
          element={<FolderFiles />}
        />
        <Route
          path="/folders/:id"
          element={<FolderDetails />}
        />
        <Route
        path="/profile"
        element={<Profile />}
        />
        <Route
        path="/notifications"
        element={
        <Notifications />}
        />
        <Route
        path="/trash"
        element={<Trash />}
        />

      </Routes>
      <ToastContainer />

    </BrowserRouter>
  );

}

export default App;