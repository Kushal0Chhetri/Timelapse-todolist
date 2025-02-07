import React from 'react';
import { useDrag } from 'react-dnd';
import { File } from '../TaskData';
import './FileCard.css';

interface FileCardProps {
  timestamp: number;
  screenshotName: string;
  fileInfo: File;
}

const FileCard: React.FC<FileCardProps> = ({ timestamp, screenshotName, fileInfo }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FILE',
    item: {
      fileName: fileInfo.fileName,
      location: fileInfo.location,
      softwareName: fileInfo.softwareName,
      timestamp: screenshotName
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }), [fileInfo, screenshotName]); // Add dependencies array

  return (
    <div 
      ref={drag}
      className={`file-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="file-info">
        <div className="file-header">
        <div className="timestamp">Filename: {fileInfo.fileName}</div>
        </div>
        <div className="file-details">
          <div className="software-name">
            <span className="label">Software: </span>
            <span>{fileInfo.softwareName}</span>
          </div>
          <div className="location">
            <span className="label">Location: </span>
            <span className="location-text">{fileInfo.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCard;