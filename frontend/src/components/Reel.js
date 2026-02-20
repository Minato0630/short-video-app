import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Reel({ video, onAction }) {
  // 🛡️ SAFETY
  if (!video || !video.filename) return null;

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const tapRef = useRef(0);

  /* =========================
     SAFE USER READ
  ========================= */
  let user = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined") {
      user = JSON.parse(stored);
    }
  } catch {
    localStorage.removeItem("user");
  }

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  /* =========================
     INIT LIKE / SAVE STATE
  ========================= */
  useEffect(() => {
    if (!user) return;
    setLiked(video.likes?.includes(user.username));
    setSaved(video.savedBy?.includes(user.username));
  }, [video, user]);

  /* =========================
     AUTOPLAY WHEN VISIBLE (FIX)
  ========================= */
  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 🔥 REQUIRED FOR AUTOPLAY
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  /* =========================
     DOUBLE TAP HANDLER
  ========================= */
  const handleTap = () => {
    const now = Date.now();

    if (now - tapRef.current < 300) {
      likeVideo();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 600);
    } else {
      if (videoRef.current) {
        videoRef.current.muted = false;
      }
    }

    tapRef.current = now;
  };

  /* =========================
     LIKE VIDEO
  ========================= */
  const likeVideo = async () => {
    if (!user) return;

    try {
      await axios.put(
        `http://localhost:5000/api/videos/like/${video._id}`,
        { username: user.username }
      );

      setLiked(prev => !prev);
      onAction && onAction(); // 🔁 refresh profile/home
    } catch (err) {
      console.error("Like failed");
    }
  };

  /* =========================
     SAVE VIDEO
  ========================= */
  const saveVideo = async () => {
    if (!user) return;

    try {
      await axios.put(
        `http://localhost:5000/api/videos/save/${video._id}`,
        { username: user.username }
      );

      setSaved(prev => !prev);
      onAction && onAction();
    } catch (err) {
      console.error("Save failed");
    }
  };

  /* =========================
     DOWNLOAD
  ========================= */
  const downloadVideo = () => {
    window.open(
      `http://localhost:5000/uploads/${video.filename}`,
      "_blank"
    );
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="reel">

      {/* VIDEO */}
      <video
        ref={videoRef}
        src={`http://localhost:5000/uploads/${video.filename}`}
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        onClick={handleTap}
      />

      {/* DOUBLE TAP HEART */}
      {showHeart && <div className="heart-pop">❤️</div>}

      {/* USERNAME */}
      <div
        className="reel-user"
        onClick={() => navigate(`/user/${video.username}`)}
      >
        @{video.username}
      </div>

      {/* ICONS */}
      <div className="reel-icons">
        <button
          className={liked ? "active" : ""}
          onClick={likeVideo}
        >
          ❤️
        </button>

        <button
          className={saved ? "active" : ""}
          onClick={saveVideo}
        >
          ⭐
        </button>

        <button onClick={downloadVideo}>
          ⬇️
        </button>
      </div>

    </div>
  );
}
