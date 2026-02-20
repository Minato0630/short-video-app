import VideoList from "../VideoList";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Profile({ videos }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);

  if (!user) return null;

  // 🔹 only this user's videos
  const myVideos = videos.filter(
    v => v.username === user.username
  );

  return (
    <div className="profile-page">

      {/* PROFILE HEADER */}
      <div className="profile-header">
        <h2>@{user.username}</h2>
        <p>My uploaded anime shorts 🔥</p>
      </div>

      {/* VIDEOS – SAME SIZE AS HOME */}
      {myVideos.length === 0 ? (
        <div className="profile-empty">
          No videos uploaded yet 🎥
        </div>
      ) : (
        <div className="feed">
          <VideoList
            videos={myVideos}
            refresh={() => window.location.reload()}
          />
        </div>
      )}

    </div>
  );
}
