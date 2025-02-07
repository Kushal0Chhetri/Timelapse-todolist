import "./App.css";
import React, { useState, useEffect } from "react";
import Todo from "./to-do";
import VideoGrid from "./VideoGrid";
import MediaPlayer from "./Component/MediaPlayer";
import { Video } from "./TaskData";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const App: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('http://localhost:3000/get-videos');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleBackToGrid = () => {
    setSelectedVideo(null);
  };

  if (loading) {
    return <div>Loading videos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="splitScreen">
        <div className="topPane">
          {selectedVideo ? (
            <div className="mediaPlayerContainer">
              <button
                onClick={handleBackToGrid}
                className="back-button"
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
    </DndProvider>
  );
};

export default App;