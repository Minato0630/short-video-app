import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../utils/api";
import UploadVideo from "../UploadVideo";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Authentication check
  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      alert("Access Denied: Admins Only");
      navigate("/");
    } else {
      fetchAdminData();
    }
  }, [navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");
    let fetchedUsers = [];
    let fetchedVideos = [];
    let usersSuccess = false;
    let videosSuccess = false;

    console.log("AdminDashboard: Starting data fetch...");
    console.log("AdminDashboard: Using API_URL =", API_URL);

    try {
      console.log("AdminDashboard: Fetching users from", `${API_URL}/api/users`);
      const usersRes = await axios.get(`${API_URL}/api/users`, { timeout: 8000 });
      fetchedUsers = usersRes.data;
      usersSuccess = true;
      console.log("AdminDashboard: Fetching users success, count =", fetchedUsers.length);
    } catch (err) {
      console.error("AdminDashboard: Error fetching users:", err);
    }

    try {
      console.log("AdminDashboard: Fetching videos from", `${API_URL}/api/videos`);
      const videosRes = await axios.get(`${API_URL}/api/videos`, { timeout: 8000 });
      fetchedVideos = videosRes.data;
      videosSuccess = true;
      console.log("AdminDashboard: Fetching videos success, count =", fetchedVideos.length);
    } catch (err) {
      console.error("AdminDashboard: Error fetching videos:", err);
    }

    if (usersSuccess && videosSuccess) {
      setUsers(fetchedUsers);
      setVideos(fetchedVideos);
      setLoading(false);
    } else {
      setError(`Failed to fetch admin data. Users API: ${usersSuccess ? "OK" : "FAILED"}. Videos API: ${videosSuccess ? "OK" : "FAILED"}. Check browser console for detailed network logs.`);
      setLoading(false);
    }
  };

  const handleRemoveUser = async (username) => {
    if (username === currentUser.username) {
      alert("You cannot remove yourself!");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to remove user @${username}? This will also delete all their videos and profile data permanently.`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/users/${username}`, {
        data: { requester: currentUser.username },
      });
      alert(`User @${username} removed successfully.`);
      fetchAdminData();
    } catch (err) {
      console.error("Remove user error:", err);
      alert("Failed to remove user");
    }
  };

  const handleRemoveVideo = async (videoId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this video?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/videos/${videoId}`, {
        data: { username: currentUser.username },
      });
      alert("Video deleted successfully.");
      fetchAdminData();
    } catch (err) {
      console.error("Delete video error:", err);
      alert("Failed to delete video");
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchAdminData}>Retry</button>
      </div>
    );
  }

  // Calculate statistics
  const totalUsers = users.length;
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes?.length || 0), 0);

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2>Admin Management Dashboard</h2>
        <p>Manage users, moderate videos, and review website analytics</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
        >
          📊 Stats & Analytics
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          👥 Manage Users ({totalUsers})
        </button>
        <button
          className={activeTab === "videos" ? "active" : ""}
          onClick={() => setActiveTab("videos")}
        >
          🎬 Manage Videos ({totalVideos})
        </button>
        <button
          className={activeTab === "upload" ? "active" : ""}
          onClick={() => setActiveTab("upload")}
        >
          ➕ Add Video
        </button>
      </div>

      <div className="admin-tab-content">
        {/* STATS TAB */}
        {activeTab === "stats" && (
          <div className="stats-tab">
            <div className="stats-grid">
              <div className="stats-card">
                <div className="stats-icon">👥</div>
                <div className="stats-info">
                  <h4>Total Users</h4>
                  <p>{totalUsers}</p>
                </div>
              </div>

              <div className="stats-card">
                <div className="stats-icon">🎬</div>
                <div className="stats-info">
                  <h4>Total Videos</h4>
                  <p>{totalVideos}</p>
                </div>
              </div>

              <div className="stats-card">
                <div className="stats-icon">👁️</div>
                <div className="stats-info">
                  <h4>Total Views</h4>
                  <p>{totalViews}</p>
                </div>
              </div>

              <div className="stats-card">
                <div className="stats-icon">❤️</div>
                <div className="stats-info">
                  <h4>Total Likes</h4>
                  <p>{totalLikes}</p>
                </div>
              </div>
            </div>

            <div className="admin-quick-links">
              <h3>Quick Actions</h3>
              <div className="quick-actions-row">
                <button onClick={() => setActiveTab("upload")}>Upload New Video</button>
                <button onClick={() => setActiveTab("users")}>View User List</button>
                <button onClick={() => setActiveTab("videos")}>Audit Videos</button>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="users-tab">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Total Views</th>
                    <th>Followers</th>
                    <th>Following</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const userVideos = videos.filter(v => v.username === u.username);
                    const totalUserViews = userVideos.reduce((sum, v) => sum + (v.views || 0), 0);
                    return (
                      <tr key={u._id} className={u.isAdmin ? "admin-row" : ""}>
                        <td>
                          <img
                            src={
                              u.avatar
                                ? (u.avatar.startsWith("data:") || u.avatar.startsWith("http") ? u.avatar : `${API_URL}${u.avatar}`)
                                : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                            }
                            alt="avatar"
                            className="admin-table-avatar"
                          />
                        </td>
                        <td>
                          {u.name} {u.isAdmin && <span className="admin-badge">Admin</span>}
                        </td>
                        <td>@{u.username}</td>
                        <td>{u.email}</td>
                        <td>{totalUserViews}</td>
                        <td>{u.followers?.length || 0}</td>
                        <td>{u.following?.length || 0}</td>
                        <td>
                          {u.isAdmin ? (
                            <span className="text-muted">System Admin</span>
                          ) : (
                            <button
                              className="btn-danger-sm"
                              onClick={() => handleRemoveUser(u.username)}
                            >
                              Remove User
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === "videos" && (
          <div className="videos-tab">
            {videos.length === 0 ? (
              <p className="no-items">No videos uploaded yet</p>
            ) : (
              <div className="admin-video-list">
                {videos.map((v) => (
                  <div key={v._id} className="admin-video-card">
                    <div className="admin-video-preview">
                      <video src={`${API_URL}/uploads/${v.filename}`} muted preload="metadata" />
                    </div>
                    <div className="admin-video-info">
                      <h4>{v.title}</h4>
                      <p className="uploader">Uploaded by @{v.username}</p>
                      <p className="desc">{v.description || "No description provided"}</p>
                      <div className="meta-stats">
                        <span>👁️ {v.views || 0} views</span>
                        <span>❤️ {v.likes?.length || 0} likes</span>
                      </div>
                      <button
                        className="btn-danger-sm block-btn"
                        onClick={() => handleRemoveVideo(v._id)}
                      >
                        Remove Video
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADD VIDEO TAB */}
        {activeTab === "upload" && (
          <div className="upload-tab">
            <UploadVideo onUpload={fetchAdminData} />
          </div>
        )}
      </div>
    </div>
  );
}
