import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Task as TaskType, File as CustomFile } from "../TaskData"; // Import the custom File type
import FileComponent from "./FileComponent";
import {
  faPlus,
  faPencilAlt,
  faTrash,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import "./Tasks.css";

interface TaskProps {
  task: TaskType;
  onUpdateFile: (taskId: string, updatedFile: CustomFile) => void; // Use the custom File type
  onDeleteFile: (taskId: string, fileId: string) => void;
  onUpdateTask: (
    taskId: string,
    updatedTask: { taskName: string; dueDate: string }
  ) => void;
  onAddFile: (taskId: string, newFile: CustomFile) => void; // Use the custom File type
  onDeleteTask: (taskId: string) => void;
}

const Task: React.FC<TaskProps> = ({
  task,
  onUpdateFile,
  onDeleteFile,
  onUpdateTask,
  onAddFile,
  onDeleteTask,
}) => {
  const { id, taskName, files, dueDate } = task;
  const [isOpen, setIsOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [addFileModal, setAddFileModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState(taskName);
  const [newDueDate, setNewDueDate] = useState(dueDate);
  const [newFileName, setNewFileName] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null); // Use the native File type

  const toggle = () => setIsOpen(!isOpen);
  const toggleEditModal = () => setEditModal(!editModal);
  const toggleAddFileModal = () => setAddFileModal(!addFileModal);

  const handleUpdateFile = (updatedFile: CustomFile) => {
    onUpdateFile(id, updatedFile);
  };

  const handleDeleteFile = (fileId: string) => {
    onDeleteFile(id, fileId);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
  };

  const handleUpdateTask = () => {
    const formattedDueDate = formatDate(newDueDate);
    onUpdateTask(id, { taskName: newTaskName, dueDate: formattedDueDate });
    toggleEditModal();
  };

  const handleAddFile = () => {
    if (newFile) {
      const fileToAdd: CustomFile = {
        id: Date.now().toString(),
        fileName: newFileName,
        location: URL.createObjectURL(newFile as Blob), // Use type assertion here
      };
      onAddFile(id, fileToAdd);
      setNewFile(null); // Clear the file input after adding
    }
    setNewFileName("");
    toggleAddFileModal();
  };

  const handleDeleteTask = () => {
    onDeleteTask(id);
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      setNewFile(event.target.files[0]); // Store the native File object
    }
  };

  return (
    <>
      <tr id={id} className="">
        <td className="text-center">
          <input type="checkbox" className="form-check-input" value={id} />
        </td>
        <td className="text-center">{taskName}</td>
        <td className="text-center">
          <button onClick={toggle} className="file-count-button">
            {files.length}
            <FontAwesomeIcon icon={faChevronDown} className="icon" />
          </button>
        </td>
        <td className="text-center">{dueDate}</td>
        <td className="text-center">
          <div className="tools-container">
            <button onClick={toggleAddFileModal} className="tool-button">
              <FontAwesomeIcon icon={faPlus} className="icon" />
            </button>
            <button onClick={toggleEditModal} className="tool-button">
              <FontAwesomeIcon icon={faPencilAlt} className="icon" />
            </button>
            <button onClick={handleDeleteTask} className="tool-button">
              <FontAwesomeIcon icon={faTrash} className="icon" />
            </button>
          </div>
        </td>
      </tr>
      {isOpen && (
        <tr id={`note-${id}`} className="">
          <td colSpan={5}>
            <div className="well">
              <table id="files" className="table table-hover">
                <tbody>
                  {files.map((file) => (
                    <FileComponent
                      key={file.id}
                      file={file}
                      onUpdate={handleUpdateFile}
                      onDelete={() => handleDeleteFile(file.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}

      {/* Modal for editing task */}
      {editModal && (
        <>
          <div className="overlay" onClick={() => setEditModal(false)} />
          <Modal
            show={editModal}
            onHide={toggleEditModal}
            className="custom-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label htmlFor="taskName">Task Name</Form.Label>
                  <Form.Control
                    type="text"
                    id="taskName"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label htmlFor="dueDate">Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    id="dueDate"
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
              <Button variant="primary" onClick={handleUpdateTask}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}

      {/* Modal for adding new file */}
      {addFileModal && (
        <>
          <div className="overlay" onClick={() => setAddFileModal(false)} />
          <Modal
            show={addFileModal}
            onHide={toggleAddFileModal}
            className="custom-modal"
          >
            <Modal.Header closeButton>
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
                  <Form.Label htmlFor="fileInput">File Upload</Form.Label>
                  <Form.Control
                    type="file"
                    id="fileInput"
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
    </>
  );
};

export default Task;
