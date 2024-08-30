import React, { useRef, useEffect, useState } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css"; // Import Plyr CSS
import { Video } from "../TaskData";
import "./MediaPlayer.css"; // Import your own CSS

interface MediaPlayerProps {
  video: Video;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ video }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const [pauseTimestamp, setPauseTimestamp] = useState<number | null>(null);
  const [actualDuration, setActualDuration] = useState<number | null>(null);

  useEffect(() => {
    if (playerRef.current) {
      const videoElement = playerRef.current.querySelector(
        "video"
      ) as HTMLVideoElement | null;

      if (videoElement) {
        const player = new Plyr(videoElement, {
          // Optional: customize Plyr options here
        });

        player.on("loadeddata", () => {
          setActualDuration(player.duration);
        });

        player.on("pause", () => {
          setPauseTimestamp(player.currentTime);
        });

        player.on("timeupdate", () => {
          setPauseTimestamp(player.currentTime);
        });

        return () => {
          player.destroy();
        };
      } else {
        console.error("Video element not found");
      }
    }
  }, [video]);

  const getScreenshotName = (pausedTime: number) => {
    if (actualDuration === null) {
      return "Calculating...";
    }

    const pausedPercent = pausedTime / actualDuration;
    const st = timeStringToSeconds(video.StartTime);
    const et = timeStringToSeconds(video.EndTime);
    const minutes = pausedPercent * (et - st) + st;

    return formatTime(minutes);
  };

  return (
    <div className="mediaPlayer" ref={playerRef}>
      <video controls>
        <source src={video.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="videoDetail">
        <div className="title">{video.title}</div>
        <div className="duration">
          {actualDuration !== null
            ? formatTime(actualDuration)
            : video.duration}
        </div>
        {pauseTimestamp !== null && (
          <div className="screenshotName">
            Screenshot name: {pauseTimestamp}-
            {getScreenshotName(pauseTimestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const formatTime = (seconds: number): string => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours().toString().padStart(2, "0");
  const mm = date.getUTCMinutes().toString().padStart(2, "0");
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const timeStringToSeconds = (timeString: string) => {
  const timeParts = timeString.split(":").map(Number);
  let seconds = 0;
  if (timeParts.length === 1) {
    seconds = timeParts[0];
  } else if (timeParts.length === 2) {
    seconds = timeParts[0] * 60 + timeParts[1];
  } else if (timeParts.length === 3) {
    seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
  } else {
    throw new Error("Invalid time format");
  }
  return seconds;
};

export default MediaPlayer;
