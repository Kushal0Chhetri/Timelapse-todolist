const Video = ({ video }: { video: any }) => {
  return (
    <div className="video-card">
      <img
        src={`./${video.thumbnail}`}
        alt={video.title}
        className="thumbnail"
      />
      <div className="video-details">
        <h3>{video.title}</h3>
        <p>Duration: {video.duration}</p>
      </div>
    </div>
  );
};

export default Video;
