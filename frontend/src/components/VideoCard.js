export default function VideoCard({ video }) {
  return (
    <div className="reel-card">
      <video
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
