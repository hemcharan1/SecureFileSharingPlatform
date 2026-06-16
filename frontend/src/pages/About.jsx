import Sidebar from "../components/Sidebar";

function About() {

  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-content">

        <div className="about-hero">

          <div className="hero-overlay">

            <h1>
              Secure File Sharing Platform
            </h1>

            <p>
              Store, Share and Manage
              Files Securely From Anywhere
            </p>

          </div>

        </div>

        <div className="about-content">

          <h2>
            About Platform
          </h2>

          <p>
            Secure File Sharing Platform
            allows users to upload,
            organize, preview, share,
            and manage files securely
            using cloud storage.
          </p>

          <div className="feature-grid">

            <div className="feature-card">
              🔒 JWT Authentication
            </div>

            <div className="feature-card">
              ☁ Cloud Storage
            </div>

            <div className="feature-card">
              📂 Folder Management
            </div>

            <div className="feature-card">
              🔗 File Sharing
            </div>

            <div className="feature-card">
              ⭐ Favorites
            </div>

            <div className="feature-card">
              📊 Dashboard Analytics
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default About;