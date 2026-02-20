import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Reel from "../components/Reel";

export default function UserProfile() {
  const { username } = useParams();

  /* =========================
     SAFE LOGGED USER
  ========================= */
  let loggedUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined") {
      loggedUser = JSON.parse(stored);
    }
  } catch {
    localStorage.removeItem("user");
  }

  const isOwner = loggedUser?.username === username;

  /* =========================
     STATE
  ========================= */
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("uploaded");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [anime, setAnime] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  /* =========================
     FETCH USER
  ========================= */
  const fetchUser = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/users/${username}`
    );

    setUser(res.data);
    setName(res.data.name || "");
    setBio(res.data.bio || "");
    setAnime(res.data.favouriteAnime || "");
  };

  /* =========================
     FETCH VIDEOS
  ========================= */
  const fetchVideos = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/videos"
    );
    setVideos(res.data);
  };

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    setLoading(true);

    Promise.all([fetchUser(), fetchVideos()])
      .finally(() => setLoading(false));
  }, [username]);

  /* =========================
     SAVE PROFILE (TEXT)
  ========================= */
  const saveProfile = async () => {
    if (!loggedUser) return;

    await axios.put(
      `http://localhost:5000/api/users/${username}`,
      {
        loggedInUser: loggedUser.username,
        name,
        bio,
        favouriteAnime: anime
      }
    );

    setEditing(false);
    fetchUser();
  };

  /* =========================
     UPLOAD AVATAR
  ========================= */
  const uploadAvatar = async () => {
    if (!avatarFile || !loggedUser) return;

    const formData = new FormData();
    formData.append("avatar", avatarFile);
    formData.append("loggedInUser", loggedUser.username);

    try {
      setUploadingAvatar(true);

      await axios.put(
        `http://localhost:5000/api/users/avatar/${username}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setAvatarFile(null);
      fetchUser(); // SPA refresh
    } catch {
      alert("Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  /* =========================
     LOADING / NULL GUARD (CRITICAL)
  ========================= */
  if (loading || !user) {
    return (
      <div className="profile-center-msg">
        Loading profile…
      </div>
    );
  }

  /* =========================
     FILTER VIDEOS
  ========================= */
  const uploaded = videos.filter(
    v => v.username === username
  );

  const liked = videos.filter(v =>
    user.likedVideos?.includes(v._id)
  );

  const saved = videos.filter(v =>
    user.savedVideos?.includes(v._id)
  );

  /* =========================
     UI
  ========================= */
  return (
    <div className="profile-page">

      {/* ===== PROFILE CARD ===== */}
      <div className="profile-card">

        {/* AVATAR */}
        <div className="avatar-box">
          <img
            className="avatar-img"
            src={
              user?.avatar && user.avatar !== ""
                ? `http://localhost:5000${user.avatar}`
                : "/default-avatar.png"
            }
            alt="avatar"
          />

          {isOwner && (
            <>
              <input
                type="file"
                accept="image/*"
                hidden
                id="avatarInput"
                onChange={e =>
                  setAvatarFile(e.target.files[0])
                }
              />

              <label
                htmlFor="avatarInput"
                className="avatar-edit"
              >
                Change
              </label>

              {avatarFile && (
                <button
                  className="btn-save"
                  disabled={uploadingAvatar}
                  onClick={uploadAvatar}
                >
                  {uploadingAvatar ? "Uploading…" : "Upload"}
                </button>
              )}
            </>
          )}
        </div>

        {/* PROFILE DETAILS */}
        {editing ? (
          <>
            <input
              className="profile-input"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              className="profile-input"
              placeholder="Favourite Anime"
              value={anime}
              onChange={e => setAnime(e.target.value)}
            />

            <textarea
              className="profile-textarea"
              placeholder="Bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />

            <div className="profile-actions">
              <button className="btn-save" onClick={saveProfile}>
                Save
              </button>
              <button
                className="btn-cancel"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>{user.name || user.username}</h2>
            <p className="username">@{user.username}</p>

            <p className="bio">
              {user.bio || "No bio yet"}
            </p>

            <p className="anime">
              ❤️ Favourite Anime: {user.favouriteAnime || "—"}
            </p>

            {isOwner && (
              <button
                className="btn-edit"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </>
        )}
      </div>

      {/* ===== TABS ===== */}
      <div className="profile-tabs">
        <button
          className={activeTab === "uploaded" ? "active" : ""}
          onClick={() => setActiveTab("uploaded")}
        >
          Uploaded
        </button>

        <button
          className={activeTab === "liked" ? "active" : ""}
          onClick={() => setActiveTab("liked")}
        >
          Liked
        </button>

        {isOwner && (
          <button
            className={activeTab === "saved" ? "active" : ""}
            onClick={() => setActiveTab("saved")}
          >
            Saved
          </button>
        )}
      </div>

      {/* ===== VIDEOS ===== */}
      <div className="profile-videos">
        {activeTab === "uploaded" &&
          uploaded.map(v => (
            <Reel
              key={v._id}
              video={v}
              onAction={() => {
                fetchUser();
                fetchVideos();
              }}
            />
          ))}

        {activeTab === "liked" &&
          liked.map(v => (
            <Reel
              key={v._id}
              video={v}
              onAction={() => {
                fetchUser();
                fetchVideos();
              }}
            />
          ))}

        {activeTab === "saved" && isOwner &&
          saved.map(v => (
            <Reel
              key={v._id}
              video={v}
              onAction={() => {
                fetchUser();
                fetchVideos();
              }}
            />
          ))}

        {activeTab === "uploaded" && uploaded.length === 0 && (
          <p className="profile-center-msg">No uploaded videos</p>
        )}

        {activeTab === "liked" && liked.length === 0 && (
          <p className="profile-center-msg">No liked videos</p>
        )}

        {activeTab === "saved" && saved.length === 0 && isOwner && (
          <p className="profile-center-msg">No saved videos</p>
        )}
      </div>
    </div>
  );
}
