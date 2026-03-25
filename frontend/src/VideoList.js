import axios from "axios";
import { useState } from "react";

export default function VideoList({ videos, refresh }) {
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const isPlayable = (filename) =>
    filename.endsWith(".mp4") ||
    filename.endsWith(".webm") ||
    filename.endsWith(".ogg");

  const startEdit = (v) => {
    setEditId(v._id);
    setTitle(v.title);
    setDescription(v.description || "");
  };

  const saveEdit = async () => {
    await axios.put(
      `http://localhost:5000/api/videos/${editId}`,
      { title, description }
    );
    setEditId(null);
    refresh();
  };

  const deleteVideo = async (id) => {
    if (!user) return;
    if (!window.confirm("Delete this video?")) return;

    await axios.delete(
      `http://localhost:5000/api/videos/${id}`,
      { data: { username: user.username } }
    );
    refresh();
  };

  return (
    <>
      {videos.map(video => (
        <div className="reel-card" key={video._id}>

          {isPlayable(video.filename) ? (
            <video controls>
              <source
              />
            </video>
          ) : (
            <div className="mkv-box">
              MKV uploaded ✔<br />
              Convert to MP4 to watch
            </div>
          )}

          <div className="reel-info">
            <h4>{video.title}</h4>
            <p>@{video.username}</p>

            {user?.username === video.username && (
              <div className="actions">
                <button onClick={() => startEdit(video)}>✏</button>
                <button onClick={() => deleteVideo(video._id)}>🗑</button>
              </div>
            )}
          </div>

        </div>
      ))}
    </>
  );
}
