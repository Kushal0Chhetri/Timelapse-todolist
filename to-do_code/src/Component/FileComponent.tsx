import React, { useState } from "react";
import { File } from "../TaskData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faTrash,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { Modal, Button, Form } from "react-bootstrap";
import "./FileComponent.css"; // Import your custom CSS file for styling

interface FileProps {
  file: File;
  onUpdate: (updatedFile: File) => void;
  onDelete: () => void;
}
const FileComponent: React.FC<FileProps> = ({ file, onUpdate, onDelete }) => {
  const [fileName, setFileName] = useState(file.fileName);
  const [location, setLocation] = useState(file.location);
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if ((e.target as HTMLElement).classList.contains("custom-modal")) {
      handleCloseModal();
    }
  };

  const handleUpdateFile = () => {
    onUpdate({ ...file, fileName, location });
    handleCloseModal();
  };

  return (
    <>
      <tr className="file-row">
        {" "}
        {/* Add the file-row class here */}
        <td className="text-center">
          <input type="checkbox" className="form-check-input" value="0" />
        </td>
        <td className="text-center">
          <span>{file.fileName}</span>
        </td>
        <td className="text-center">
          <>
            <button
              className="tool-button"
              onClick={() => {
                setFileName(file.fileName);
                setLocation(file.location);
                handleShowModal();
              }}
            >
              <FontAwesomeIcon icon={faPencilAlt} className="icon" />
            </button>
            <button className="tool-button" onClick={onDelete}>
              <FontAwesomeIcon icon={faTrash} className="icon" />
            </button>
          </>
        </td>
      </tr>
      {showModal && (
        <>
          <div className="overlay" onClick={handleBackdropClick} />
          <Modal
            show={showModal}
            onHide={handleCloseModal}
            className="custom-modal text-center"
          >
            <Modal.Header>
              <div className="row w-100">
                <div className="col">
                  <div className="modal-title h4">Edit File</div>
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={handleCloseModal}
                  >
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="cursor-pointer"
                    />
                  </button>
                </div>
              </div>
            </Modal.Header>

            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>File Name:</Form.Label>
                  <Form.Control
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>File Location:</Form.Label>
                  <Form.Control
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
              <Button variant="primary" onClick={handleUpdateFile}>
                Save File
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
};

export default FileComponent;
