export const tasks = [
  {
    id: "1",
    taskName: "Task 1",
    files: [
      { id: "1", fileName: "Tasks.tsx", location: "location1" },
      { id: "2", fileName: "ScreenCapture.swift", location: "location2" },
    ],
    dueDate: "07/06/2024",
  },
  {
    id: "2",
    taskName: "Task 2",
    files: [
      {id: "3",fileName: "file3", location: "location3" },
    ],
    dueDate: "07/06/2024",
  },
  {
    id: "4",
    taskName: "Task 4",
    files: [
    ],
    dueDate: "07/06/2024",
  },
];

export interface Video {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  StartTime: string;
  EndTime: string;
  src: string;
}

export const videos: Video[] = [
  {
    id: 1,
    title: "07/10/2024",
    thumbnail: "screenshot1.jpg",
    duration: "5:30",
    StartTime: "13:22:46",
    EndTime: "null",
    src: "TimeLapseVideo07312024.mp4",
  },
  {
    id: 2,
    title: "07/11/2024",
    thumbnail: "screenshot2.jpg",
    duration: "3:45",
    StartTime: "13:22:46",
    EndTime: "null",
    src: "TimeLapseVideo07132024.mp4",
  },
  {
    id: 3,
    title: "07/12/2024",
    thumbnail: "screenshot3.jpg",
    duration: "4:15",
    StartTime: "13:22:46",
    EndTime: "null",
    src: "TimeLapseVideo07142024.mp4",
  },
  {
    id: 4,
    title: "07/13/2024",
    thumbnail: "screenshot4.jpg",
    duration: "2:50",
    StartTime: "13:22:46",
    EndTime: "null",
    src: "TimeLapseVideo07102024.mp4",
  },

  {
    id: 5,
    title: "08/05/2024",
    thumbnail: "screenshot4.jpg",
    duration: "0:08",
    StartTime: "13:22:46",
    EndTime: "13:41:45",
    src: "TimeLapseVideo08052024.mp4",
  },
];


export interface Task {
  id: string;
  taskName: string;
  files: File[];
  dueDate: string;
  completed: boolean;
}

export interface File {
  id: string;
  fileName: string;
  location: string;
}
