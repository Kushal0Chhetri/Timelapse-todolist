import "./VideoGrid.css";
import { Video } from "./TaskData";
import { useState, useRef, useEffect } from 'react';

interface VideoGridProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, onVideoSelect }) => {
  return (
    <div className="videoGrid">
      {videos.map((video) => (
        <VideoCard 
          key={video.id} 
          video={video} 
          onSelect={onVideoSelect} 
        />
      ))}
    </div>
  );
};

interface VideoCardProps {
  video: Video;
  onSelect: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleLoaded = () => {
        setIsLoading(false);
        videoElement.currentTime = 1; // Set to 1 second to get a non-black thumbnail
      };

      const handleError = () => {
        setIsLoading(false);
        setError('Failed to load video');
      };

      videoElement.addEventListener('loadeddata', handleLoaded);
      videoElement.addEventListener('error', handleError);

      return () => {
        videoElement.removeEventListener('loadeddata', handleLoaded);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <div className="videoCard" onClick={() => onSelect(video)}>
      <div className="videoThumbnail">
        {isLoading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        <video 
          ref={videoRef}
          preload="metadata"
          muted
          playsInline
        >
          <source src={video.src} type="video/mp4" />
        </video>
      </div>
      <div className="videoInfo">
        <h2>{video.title}</h2>
        <p>{video.duration}</p>
      </div>
    </div>
  );
};

export default VideoGrid;