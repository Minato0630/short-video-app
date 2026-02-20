import { useEffect, useRef, useState } from "react";
import Reel from "../components/Reel";

export default function Home({ videos = [] }) {
  const feedRef = useRef(null);
  const [list, setList] = useState([]);

  // create infinite loop list
  useEffect(() => {
    if (videos.length > 0) {
      setList([...videos, ...videos]); // duplicate once
    }
  }, [videos]);

  const handleScroll = () => {
    const feed = feedRef.current;
    if (!feed) return;

    // when near bottom → duplicate again
    if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 200) {
      setList(prev => [...prev, ...videos]);
    }
  };

  if (!videos.length) {
    return (
      <div style={{ color: "#aaa", textAlign: "center", marginTop: "40vh" }}>
        No videos available 🎥
      </div>
    );
  }

  return (
    <div
      className="reels-feed"
      ref={feedRef}
      onScroll={handleScroll}
    >
      {list.map((video, i) => (
        <Reel key={`${video._id}-${i}`} video={video} />
      ))}
    </div>
  );
}
