import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../utils/api";

export default function DownloadVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("720p");
  const [selectedFormat, setSelectedFormat] = useState("mp4");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const qualities = [
    { label: "1080p", desc: "Full HD Quality", size: "24.5 MB", bitrate: "5 Mbps" },
    { label: "720p", desc: "Standard HD Quality", size: "14.2 MB", bitrate: "2.5 Mbps" },
    { label: "480p", desc: "Medium Quality", size: "7.8 MB", bitrate: "1.2 Mbps" },
    { label: "360p", desc: "Data Saver Quality", size: "4.1 MB", bitrate: "600 Kbps" },
  ];

  const formats = [
    { extension: "mp4", label: "MP4 Video", desc: "Most compatible video format" },
    { extension: "mkv", label: "MKV Container", desc: "High quality container" },
  ];

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/videos/${id}`);
        setVideo(res.data);
        
        // Auto-detect and preselect the original file extension to prevent corruption
        const ext = res.data.filename.split(".").pop().toLowerCase();
        if (ext === "mp4" || ext === "mkv") {
          setSelectedFormat(ext);
        } else {
          setSelectedFormat("mp4"); // Fallback
        }
      } catch (err) {
        console.error("Fetch video for download failed:", err);
        setError("Video not found or database connection failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);

    const steps = [
      { text: "Connecting to media server...", limit: 20 },
      { text: `Transcoding file to ${selectedQuality} in .${selectedFormat}...`, limit: 50 },
      { text: "Compiling video segments...", limit: 80 },
      { text: "Preparing file for download...", limit: 100 },
    ];

    let currentStepIndex = 0;
    setStatusText(steps[0].text);

    // Simulate progress bar
    const interval = setInterval(async () => {
      setProgress((prev) => {
        const nextProgress = prev + Math.floor(Math.random() * 8) + 2;
        
        // Update status text based on progress limit
        if (nextProgress >= steps[currentStepIndex].limit && currentStepIndex < steps.length - 1) {
          currentStepIndex += 1;
          setStatusText(steps[currentStepIndex].text);
        }

        if (nextProgress >= 100) {
          clearInterval(interval);
          setStatusText("Download starting!");
          
          // Trigger actual download via attachment link
          triggerActualDownload();
          
          setTimeout(() => {
            setDownloading(false);
            setProgress(0);
            setStatusText("");
          }, 1500);

          return 100;
        }
        return nextProgress;
      });
    }, 150);
  };

  const triggerActualDownload = () => {
    const cleanTitle = video.title.trim().replace(/[^a-zA-Z0-9]/g, "_") || "anime_short";
    const downloadUrl = `${API_URL}/api/videos/download/${video.filename}?title=${encodeURIComponent(cleanTitle)}&quality=${selectedQuality}&format=${selectedFormat}`;
    
    // Set window.location.href to trigger the browser's download prompt immediately
    window.location.href = downloadUrl;
  };

  if (loading) {
    return (
      <div className="download-loading">
        <div className="spinner"></div>
        <p>Fetching video metadata...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="download-error">
        <h3>Video Not Found</h3>
        <p>{error || "The requested video could not be loaded."}</p>
        <button onClick={() => navigate("/")}>Return Home</button>
      </div>
    );
  }

  const originalExt = video.filename.split(".").pop().toLowerCase();

  return (
    <div className="download-page-container">
      <div className="download-content-box">
        <div className="back-btn-container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Back to Feed
          </button>
        </div>

        <h2>Download Center</h2>
        <p className="sub">Select your preferred video resolution and file format to download</p>

        <div className="download-preview-section">
          <div className="download-video-preview">
            <video
              src={`${API_URL}/uploads/${video.filename}`}
              controls
              muted
              preload="metadata"
            />
          </div>
          <div className="download-video-details">
            <h3>{video.title}</h3>
            <p className="author">Uploaded by @{video.username}</p>
            <p className="desc">{video.description || "No description available"}</p>
          </div>
        </div>

        {/* RESOLUTION SELECTOR */}
        <div className="quality-selector-section">
          <h3>Choose Resolution</h3>
          <div className="qualities-grid">
            {qualities.map((q) => (
              <div
                key={q.label}
                className={`quality-card ${selectedQuality === q.label ? "active" : ""}`}
                onClick={() => !downloading && setSelectedQuality(q.label)}
              >
                <div className="quality-badge">{q.label}</div>
                <div className="quality-details">
                  <span className="q-desc">{q.desc}</span>
                  <span className="q-size">Est. Size: {q.size}</span>
                </div>
                <div className="quality-radio">
                  <div className="radio-outer">
                    <div className="radio-inner"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMAT SELECTOR */}
        <div className="format-selector-section" style={{ marginTop: "24px", marginBottom: "30px" }}>
          <h3 style={{ color: "#ff3333", margin: "0 0 15px 0", fontSize: "18px", letterSpacing: "0.5px" }}>Choose File Format</h3>
          <div className="formats-grid" style={{ display: "flex", gap: "15px" }}>
            {formats.map((f) => {
              const isOriginal = originalExt === f.extension;
              return (
                <div
                  key={f.extension}
                  className={`format-card ${selectedFormat === f.extension ? "active" : ""}`}
                  onClick={() => !downloading && setSelectedFormat(f.extension)}
                  style={{
                    flex: 1,
                    background: "#050505",
                    border: selectedFormat === f.extension ? "1px solid #ff3333" : "1px solid #222",
                    borderRadius: "10px",
                    padding: "16px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span className="format-ext" style={{ fontWeight: "700", fontSize: "16px", color: selectedFormat === f.extension ? "#ff3333" : "white" }}>
                    .{f.extension.toUpperCase()} {isOriginal && <span style={{ fontSize: "12px", color: "#00ff9d", fontWeight: "normal" }}>(Original)</span>}
                  </span>
                  <span className="format-desc" style={{ color: "#aaa", fontSize: "13px" }}>
                    {f.desc}
                  </span>
                </div>
              );
            })}
          </div>
          {selectedFormat !== originalExt && (
            <p style={{ color: "#ffc107", fontSize: "13px", marginTop: "12px", marginHeader: "0", lineHeight: "1.4" }}>
              ⚠️ Warning: You selected a different file format than the original (.{originalExt.toUpperCase()}). Some media players may fail to play the downloaded file due to extension mismatch. We recommend choosing the Original format.
            </p>
          )}
        </div>

        {downloading ? (
          <div className="download-progress-container">
            <div className="progress-bar-outer">
              <div className="progress-bar-inner" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-labels">
              <span className="status-txt">{statusText}</span>
              <span className="percent-txt">{progress}%</span>
            </div>
          </div>
        ) : (
          <button className="btn-download-action" onClick={handleDownload}>
            Download Video ({selectedQuality} - .{selectedFormat.toUpperCase()})
          </button>
        )}
      </div>
    </div>
  );
}
