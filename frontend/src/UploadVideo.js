import axios from "axios";
import { useState } from "react";

export default function UploadVideo({ onUpload }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    if (!video) {
      alert("Please choose a video file");
      return;
    }

    try {
      setUploading(true);

      // Get logged-in user (safe)
      const user = JSON.parse(localStorage.getItem("user"));

      const formData = new FormData();
      formData.append("title", title || "Untitled Video");
      formData.append("description", description || "");
      formData.append("video", video);
      formData.append("username", user?.username || "guest");

      await axios.post(
`${API_URL}/api/videos/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // Reset form
      setTitle("");
      setDescription("");
      setVideo(null);

      // ✅ SAFE refresh call (NO CRASH)
      if (typeof onUpload === "function") {
        onUpload();
      }

      alert("Video uploaded successfully 🎉");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h3>UPLOAD VIDEO</h3>

        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Video Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          accept="video/mp4,video/mkv,video/mov,video/webm"
          onChange={(e) => setVideo(e.target.files[0])}
        />

        <button onClick={upload} disabled={uploading}>
          {uploading ? "Uploading..." : "UPLOAD"}
        </button>
      </div>
    </div>
  );
}
