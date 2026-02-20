export default function VideoCard({ video }) {
  return (
    <div className="reel-card">
      <video
        src={`http://localhost:5000/uploads/${video.filename}`}
        controls
        loop
      />
      <div className="reel-info">
        <h4>{video.title}</h4>
        <p>@{video.username}</p>
      </div>
    </div>
  );
}
