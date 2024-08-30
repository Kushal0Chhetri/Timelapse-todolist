import "./VideoGrid.css"; // Import CSS for styling
import { Video } from "./TaskData"; // Adjust path as per your project structure

interface VideoGridProps {
  videos: Video[];
  onVideoSelect: (video: Video) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, onVideoSelect }) => {
  return (
    <div className="videoGrid">
      {videos.map((video) => (
        <div
          className="videoCard"
          key={video.id}
          onClick={() => onVideoSelect(video)}
        >
          <img src={`./${video.thumbnail}`} alt={video.title} />
          <div className="videoInfo">
            <h2>{video.title}</h2>
            <p>{video.duration}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
