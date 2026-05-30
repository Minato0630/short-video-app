import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_URL from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Reel({ video, onAction }) {
  if (!video || !video.filename) return null;

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const tapRef = useRef(0);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [views, setViews] = useState(video.views || 0);
  const hasViewed = useRef(false);

  /* INIT STATE */
  useEffect(() => {
    setViews(video.views || 0);
    if (!user) return;
    setLiked(video.likes?.includes(user.username) || false);
    setSaved(video.savedBy?.includes(user.username) || false);
  }, [video, user]);

  /* AUTOPLAY FIX */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.muted = true;
          el.play().catch(() => {});
          
          if (!hasViewed.current) {
            hasViewed.current = true;
            // Increment view count in database
            axios.put(`${API_URL}/api/videos/view/${video._id}`)
              .then(() => {
                setViews(prev => prev + 1);
              })
              .catch(err => console.error("Error logging view:", err));
          }
        } else {
          el.pause();
        }
      },
      { threshold: 0.7 }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  /* DOUBLE TAP */
  const handleTap = () => {
    const now = Date.now();
    if (now - tapRef.current < 300) {
      likeVideo();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 600);
    }
    tapRef.current = now;
  };

  /* LIKE */
  const likeVideo = async () => {
    if (!user) return;

    await axios.put(
      `${API_URL}/api/videos/like/${video._id}`,
      { username: user.username }
    );

    setLiked(prev => !prev);
    onAction && onAction();
  };

  /* SAVE */
  const saveVideo = async () => {
    if (!user) return;

    await axios.put(
      `${API_URL}/api/videos/save/${video._id}`,
      { username: user.username }
    );

    setSaved(prev => !prev);
    onAction && onAction();
  };

  /* ADMIN DELETE */
  const deleteVideoAdmin = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this video as Admin?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/videos/${video._id}`, {
        data: { username: user.username }
      });
      alert("Video deleted successfully.");
      if (onAction) {
        onAction();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Delete video failed:", err);
      alert("Failed to delete video");
    }
  };

  return (
    <div className="reel">
      <video
        ref={videoRef}
        src={`${API_URL}/uploads/${video.filename}`}
        muted
        loop
        playsInline
        preload="metadata"
        onClick={handleTap}
      />

      {showHeart && <div className="heart-pop">❤️</div>}

      <div
        className="reel-user"
        onClick={() => navigate(`/user/${video.username}`)}
      >
        @{video.username}
      </div>

      <div className="reel-icons">
        <div className="reel-view-count" style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#ddd",
          backgroundColor: "rgba(0,0,0,0.6)",
          padding: "6px 8px",
          borderRadius: "15px",
          marginBottom: "5px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          justifyContent: "center"
        }} title="Views">
          👁️ {views}
        </div>
        <button className={liked ? "active" : ""} onClick={likeVideo}>❤️</button>
        <button className={saved ? "active" : ""} onClick={saveVideo}>⭐</button>
        <button onClick={() => navigate(`/download/${video._id}`)}>⬇️</button>
        {user && user.isAdmin && (
          <button
            onClick={deleteVideoAdmin}
            style={{ backgroundColor: "#ff1a1a" }}
            title="Delete Video (Admin)"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
