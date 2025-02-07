import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Task as TaskType, File as CustomFile } from "../TaskData";
import FileComponent from "./FileComponent";
import { File } from '../TaskData';
import {
  faPencilAlt,
  faTrash,
  faCalendarAlt,
  faChevronCircleRight,
  faChevronCircleDown,
  faFileUpload,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import "./Tasks.css";
import { CSSTransition, TransitionGroup } from "react-transition-group"; // New imports for animation
import { useDrop } from 'react-dnd';

interface TaskProps {
  task: TaskType;
  onUpdateFile: (taskId: string, updatedFile: CustomFile) => void;
  onDeleteFile: (taskId: string, fileId: string) => void;
  onUpdateTask: (
    taskId: string,
    updatedTask: { taskName: string; dueDate: string }
  ) => void;
  onAddFile: (taskId: string, newFile: CustomFile) => void;
  onDeleteTask: (taskId: string) => void;
  onCheckboxChange: (taskId: string, isChecked: boolean) => void; // New prop for handling checkbox
}

const Task: React.FC<TaskProps> = ({
  task,
  onUpdateFile,
  onDeleteFile,
  onUpdateTask,
  onAddFile,
  onDeleteTask,
  onCheckboxChange,
}) => {
  const { id, taskName, files, dueDate } = task;
  const [editModal, setEditModal] = useState(false);
  const [addFileModal, setAddFileModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState(taskName);
  const [newDueDate, setNewDueDate] = useState(dueDate);
  const [newFileName, setNewFileName] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isFileDropdownOpen, setIsFileDropdownOpen] = useState(false); // Toggle for file dropdown
  const toggleEditModal = () => setEditModal(!editModal);
  const toggleAddFileModal = () => setAddFileModal(!addFileModal);
  const toggleFileDropdown = () => setIsFileDropdownOpen(!isFileDropdownOpen); // Toggle function for dropdown
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"task" | "file">("task");
  const [fileIdToDelete, setFileIdToDelete] = useState<string | null>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FILE',
    drop: (item: {
      fileName: string,
      location: string,
      softwareName: string,
      timestamp: string
    }) => {
      console.log("Dropping item:", item); // Debug log
      const newFile: File = {
        id: Date.now().toString(),
        fileName: item.fileName,
        location: item.location,
        softwareName: item.softwareName
      };
      onAddFile(task.id, newFile);
    },
    collect: monitor => ({
      isOver: !!monitor.isOver()
    })
  }), [task.id, onAddFile]); // Add dependencies array
  
  const confirmDeleteTask = () => {
    setDeleteTarget("task");
    setShowDeleteModal(true);
  };

  const confirmDeleteFile = (fileId: string) => {
    setDeleteTarget("file");
    setFileIdToDelete(fileId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmation = () => {
    if (deleteTarget === "task") {
      onDeleteTask(id);
    } else if (deleteTarget === "file" && fileIdToDelete) {
      handleDeleteFile(fileIdToDelete);
    }
    setShowDeleteModal(false);
  };


  const handleUpdateFile = (updatedFile: CustomFile) => {
    onUpdateFile(id, updatedFile);
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/delete-file/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      // Assuming the API returns a success message or status
      console.log("File deleted successfully");

      // Call your `onDeleteFile` function to update the UI
      onDeleteFile(id, fileId);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleEditTask = () => {
    onUpdateTask(id, { taskName: newTaskName, dueDate: newDueDate });
    toggleEditModal();
  };

  // Keep handleAddFile in Tasks.tsx but modify it
  const handleAddFile = () => {
    if (newFile && newFileName.trim() !== "") {
      const fileData = {
        id: Date.now().toString(),
        fileName: newFileName.trim(),
        location: URL.createObjectURL(newFile),
        softwareName: 'Unknown'
      };

      // Call parent's onAddFile
      onAddFile(id, fileData);

      // Clear form and close modal
      setNewFileName("");
      setNewFile(null);
      toggleAddFileModal();
    } else {
      alert("Please provide a file name and select a file");
    }
  };

  // Function to fetch files when user clicks the dropdown
  const fetchFilesOnDropdownClick = async () => {
    try {
      if (!isFileDropdownOpen) {
        const response = await fetch(`http://localhost:3000/get-files/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const filesData = await response.json();
        console.log("Fetched files data: ", filesData);

        // Just update the files array directly
        task.files = filesData;
      }
      setIsFileDropdownOpen(!isFileDropdownOpen);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckboxChange(id, e.target.checked); // Notify parent component
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setNewFile(file);
    }
  };

  const handleDeleteTask = () => {
    onDeleteTask(id);
  };

  return (
    <>
      <div
        ref={drop}
        className={`task-wrapper ${task.completed ? 'completed-task' : ''} 
              ${isOver ? 'bg-blue-50 border-2 border-blue-500' : ''}`}
      >
        <div className="task-row">
          <input
            type="checkbox"
            onChange={handleCheckboxChange}
            className="custom-checkbox"
          />
          <div className="task-container">
            <div className="task-name">
              <span>{taskName}</span>
              <div className="tools-container">
                <button onClick={toggleEditModal} className="tool-button">
                  <FontAwesomeIcon icon={faPencilAlt} className="icon" />
                  <div className="tooltip-text">Edit Task</div>
                </button>
                <button onClick={confirmDeleteTask} className="tool-button">
                  <FontAwesomeIcon icon={faTrash} className="icon" />
                  <div className="tooltip-text">Delete Task</div>
                </button>
              </div>
            </div>

            <div className="due-date">
              <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
              <span>{`Due ${new Date(dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}</span>
            </div>
          </div>
        </div>

        <div className="file-dropdown-row">
          <button className="file-dropdown-btn" onClick={fetchFilesOnDropdownClick}>
            <FontAwesomeIcon
              icon={isFileDropdownOpen ? faChevronCircleDown : faChevronCircleRight}
              className="dropdown-icon"
            />
            <span>{isFileDropdownOpen ? " View Resources" : " View Resources"}</span>
          </button>
          {isFileDropdownOpen && (
            <div className="file-list">
              {/* Add Files button */}
              <button className="add-files-button" onClick={toggleAddFileModal}>
                <FontAwesomeIcon icon={faPlus} className="plus-icon" />
                <span>Add Files</span>
              </button>

              {files.length > 0 ? (
                files.map((file) => (
                  <FileComponent
                    key={file.id}
                    file={file}
                    onUpdate={handleUpdateFile}
                    onDelete={() => handleDeleteFile(file.id)}
                  />
                ))
              ) : (
                <p>No files attached</p>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Modal for editing a task */}
      {editModal && (
        <>
          <div className="overlay" onClick={toggleEditModal} />
          <Modal
            show={editModal}
            onHide={toggleEditModal}
            className="custom-modal"
          >
            <Modal.Header>
              <Modal.Title>Edit Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label htmlFor="editTaskName">Task Name</Form.Label>
                  <Form.Control
                    type="text"
                    id="editTaskName"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label htmlFor="editDueDate">Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    id="editDueDate"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={toggleEditModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleEditTask}>
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}

      {/* Modal for adding a new file */}
      {addFileModal && (
        <>
          <div className="overlay" onClick={toggleAddFileModal} />
          <Modal
            show={addFileModal}
            onHide={toggleAddFileModal}
            className="custom-modal"
          >
            <Modal.Header>
              <Modal.Title>Add New File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label htmlFor="fileName">File Name</Form.Label>
                  <Form.Control
                    type="text"
                    id="fileName"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label htmlFor="file">File</Form.Label>
                  <Form.Control
                    type="file"
                    id="file"
                    onChange={handleFileInputChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={toggleAddFileModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddFile}>
                Add File
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}

      {/* Modal for confirming deleting */}
      {showDeleteModal && (
        <>
          <div className="overlay" onClick={() => setShowDeleteModal(false)} />
          <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            className="custom-modal delete-confirmation-modal" // Added custom class here
          >
            <Modal.Header>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete this {deleteTarget}?</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (deleteTarget === "task") {
                    handleDeleteTask(); // Call the actual delete function for tasks
                  } else if (deleteTarget === "file") {
                    //handleDeleteFile(fileIdToDelete); // Call the actual delete function for files
                  }
                  setShowDeleteModal(false); // Close the modal after deletion
                }}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
};

export default Task;
