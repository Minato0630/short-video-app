import { useEffect, useRef, useState } from "react";
import axios from "axios";
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

  /* INIT STATE */
  useEffect(() => {
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
      `http://localhost:5000/api/videos/like/${video._id}`,
      { username: user.username }
    );

    setLiked(prev => !prev);
    onAction && onAction();
  };

  /* SAVE */
  const saveVideo = async () => {
    if (!user) return;

    await axios.put(
      `http://localhost:5000/api/videos/save/${video._id}`,
      { username: user.username }
    );

    setSaved(prev => !prev);
    onAction && onAction();
  };

  return (
    <div className="reel">
      <video
        ref={videoRef}
        src={`http://localhost:5000/uploads/${video.filename}`}
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
        <button className={liked ? "active" : ""} onClick={likeVideo}>❤️</button>
        <button className={saved ? "active" : ""} onClick={saveVideo}>⭐</button>
        <button onClick={() => window.open(
          `http://localhost:5000/uploads/${video.filename}`
        )}>⬇️</button>
      </div>
    </div>
  );
}