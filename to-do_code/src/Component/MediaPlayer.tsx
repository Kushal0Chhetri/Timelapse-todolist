import React, { useRef, useEffect, useState } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import { Video, File } from "../TaskData";
import "./MediaPlayer.css";
import FileCard from './FileCard';

interface MediaPlayerProps {
  video: Video;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ video }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const metadataArrayRef = useRef<File[]>([]);  // Use ref for metadata array
  const [pauseTimestamp, setPauseTimestamp] = useState<number | null>(null);
  const [actualDuration, setActualDuration] = useState<number | null>(null);
  const [currentMetadata, setCurrentMetadata] = useState<File | null>(null);

  useEffect(() => {
    // Extract date from video filename
    const dateMatch = video.title.match(/TimeLapseVideo(\d{8})/);
    if (dateMatch) {
      const date = dateMatch[1];
      fetchMetadata(date);
    }
  }, [video]);

  const fetchMetadata = async (date: string) => {
    try {
      const response = await fetch(`http://localhost:3000/get-video-metadata/${date}`);
      const data = await response.json();
      metadataArrayRef.current = data;  // Store in ref instead of state
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }
  };

  const getCurrentMetadata = (currentTime: number) => {
    let index = Math.floor(currentTime * 6);
    console.log("time = ", currentTime);
    console.log("index = ", index);
    const metadata = metadataArrayRef.current[index];
    if (metadata) {
      return {
        fileName: metadata.Filename,
        location: metadata.Location,
        softwareName: metadata.SoftwareName
      };
    }
    return null;
  };

  useEffect(() => {
    if (playerRef.current) {
      const videoElement = playerRef.current.querySelector("video") as HTMLVideoElement | null;

      if (videoElement) {
        const player = new Plyr(videoElement, {});

        player.on("loadeddata", () => {
          setActualDuration(player.duration);
        });

        player.on("timeupdate", () => {
          const time = player.currentTime;
          const metadata = getCurrentMetadata(time);
          console.log("metadata = ", metadata);
          setPauseTimestamp(time);
          setCurrentMetadata(metadata);
        });

        return () => player.destroy();
      }
    }
  }, [video]);

  return (
    <div className="mediaPlayer" ref={playerRef}>
      <video controls>
        <source src={video.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="videoDetails">
        <div className="title">{video.title}</div>
        <div className="duration">
          {actualDuration !== null ? formatTime(actualDuration) : video.duration}
        </div>

        {pauseTimestamp !== null && currentMetadata && (
          <div className="screenshot-container">
            <FileCard
              timestamp={pauseTimestamp}
              screenshotName={formatTime(pauseTimestamp)}
              fileInfo={currentMetadata}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

export default MediaPlayer;