import "./App.css";
import React, { useState } from "react";
import Todo from "./to-do";
import VideoGrid from "./VideoGrid";
import MediaPlayer from "./Component/MediaPlayer";
import { videos, Video } from "./TaskData";

const App: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleBackToGrid = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="splitScreen">
      <div className="topPane">
        {selectedVideo ? (
          <div className="mediaPlayerContainer">
            <button
              onClick={handleBackToGrid}
              style={{
                padding: "10px",
                marginTop: "10px",
                border: "1px solid",
              }}
            >
              Back to Grid
            </button>
            <MediaPlayer video={selectedVideo} />
          </div>
        ) : (
          <div>
            <h2>Video Grid</h2>
            <div className="videoGridContainer">
              <VideoGrid videos={videos} onVideoSelect={handleVideoSelect} />
            </div>
          </div>
        )}
      </div>
      <div className="bottomPane">
        <Todo />
      </div>
    </div>
  );
};

export default App;
