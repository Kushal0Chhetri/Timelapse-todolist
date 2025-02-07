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
  screenshots: {
    [timestamp: string]: File;  // Map timestamps to File objects
  };
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
    screenshots: {
      // Add a screenshot every 5 seconds for testing
      "00:00:00": {
        id: "1",
        fileName: "Homepage - Chrome",
        location: "https://www.google.com",
        softwareName: "Google Chrome"
      },
      "00:00:02": {
        id: "2",
        fileName: "Project Documentation",
        location: "/Users/documents/project.md",
        softwareName: "Visual Studio Code"
      },
      "00:00:04": {
        id: "3",
        fileName: "Email Client",
        location: "https://mail.google.com",
        softwareName: "Google Chrome"
      },
      "00:00:05": {
        id: "4",
        fileName: "Terminal",
        location: "Terminal App",
        softwareName: "Terminal"
      }
    }
  },
  {
    id: 2,
    title: "07/11/2024",
    thumbnail: "screenshot2.jpg",
    duration: "3:45",
    StartTime: "13:22:46",
    EndTime: "null",
    src: "TimeLapseVideo07132024.mp4",
    screenshots: {
      "00:00:03": {
        id: "3",
        fileName: "React Documentation - Components",
        location: "https://react.dev/docs/components",
        softwareName: "Firefox"
      }
    }
  },
  {
    id: 3,
    title: "07/12/2024",
    thumbnail: "screenshot3.jpg",
    duration: "4:15",
    StartTime: "13:22:46",
    EndTime: "null",
    src: "TimeLapseVideo07142024.mp4",
    screenshots: {
      "00:00:05": {
        id: "1",
        fileName: "Personalizing your profile - GitHub Docs",
        location: "https://docs.github.com/en/account-and-profile/customizing-your-profile",
        softwareName: "Google Chrome"
      },
      "00:00:10": {
        id: "2",
        fileName: "Machine Learning Project - Jupyter Notebook",
        location: "/Users/documents/ML_Project.ipynb",
        softwareName: "Visual Studio Code"
      }
    }
  },
  {
    id: 4,
    title: "07/13/2024",
    thumbnail: "screenshot4.jpg",
    duration: "2:50",
    StartTime: "13:22:46",
    EndTime: "null",
    src: "TimeLapseVideo07102024.mp4",
    screenshots: {
      "00:00:05": {
        id: "1",
        fileName: "Personalizing your profile - GitHub Docs",
        location: "https://docs.github.com/en/account-and-profile/customizing-your-profile",
        softwareName: "Google Chrome"
      },
      "00:00:10": {
        id: "2",
        fileName: "Machine Learning Project - Jupyter Notebook",
        location: "/Users/documents/ML_Project.ipynb",
        softwareName: "Visual Studio Code"
      }
    }
  },

  {
    id: 5,
    title: "08/05/2024",
    thumbnail: "screenshot4.jpg",
    duration: "0:08",
    StartTime: "13:22:46",
    EndTime: "13:41:45",
    src: "TimeLapseVideo08052024.mp4",
    screenshots: {
      "00:00:05": {
        id: "1",
        fileName: "Personalizing your profile - GitHub Docs",
        location: "https://docs.github.com/en/account-and-profile/customizing-your-profile",
        softwareName: "Google Chrome"
      },
      "00:00:10": {
        id: "2",
        fileName: "Machine Learning Project - Jupyter Notebook",
        location: "/Users/documents/ML_Project.ipynb",
        softwareName: "Visual Studio Code"
      }
    }
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
  id?: string;
  fileName: string;
  location: string;
  softwareName: string;
}
