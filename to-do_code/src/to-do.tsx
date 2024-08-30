import { useState } from "react";
import TaskHeader from "./Component/taskHeader";
import Task from "./Component/Tasks";
import { tasks as tasksData, Task as TaskType, File } from "./TaskData";
import { Modal, Button, Form } from "react-bootstrap";

const Todo = () => {
  const [tasks, setTasks] = useState<TaskType[]>(tasksData);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const handleAddTask = () => {
    if (newTaskName.trim() === "" || newDueDate.trim() === "") {
      alert("Please fill in all fields");
      return;
    }
    const newTask: TaskType = {
      id: Date.now().toString(), // Generate a unique ID
      taskName: newTaskName,
      files: [], // Initial tasks have no files
      dueDate: newDueDate,
    };
    setTasks([...tasks, newTask]);
    setShowAddTaskModal(false); // Close the modal
    setNewTaskName(""); // Clear the form
    setNewDueDate("");
  };

  const onUpdateFile = (taskId: string, updatedFile: File) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedFiles = task.files.map((file) =>
          file.id === updatedFile.id ? updatedFile : file
        );
        return { ...task, files: updatedFiles };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const onDeleteFile = (taskId: string, fileId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedFiles = task.files.filter((file) => file.id !== fileId);
        return { ...task, files: updatedFiles };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const onUpdateTask = (
    taskId: string,
    updatedTask: { taskName: string; dueDate: string }
  ) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, ...updatedTask } : task
    );
    setTasks(updatedTasks);
  };

  const onAddFile = (taskId: string, newFile: File) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, files: [...task.files, newFile] };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const onDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
  };

  return (
    <div className="todo-container">
      <TaskHeader />
      <Button
        variant="primary"
        onClick={() => setShowAddTaskModal(true)}
        className="mb-3"
      >
        Add Task
      </Button>
      <main>
        <table id="tasks" className="table table-hover">
          <thead>
            <tr>
              <th></th>
              <th className="text-center">Task</th>
              <th className="text-center"># of files</th>
              <th className="text-center">Due date</th>
              <th className="text-center">Tools</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <Task
                key={task.id}
                task={task}
                onUpdateFile={onUpdateFile}
                onDeleteFile={onDeleteFile}
                onUpdateTask={onUpdateTask}
                onAddFile={onAddFile}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </tbody>
        </table>
      </main>

      {/* Modal for adding a new task */}
      {showAddTaskModal && (
        <>
          <div className="overlay" onClick={() => setShowAddTaskModal(false)} />
          <Modal
            show={showAddTaskModal}
            onHide={() => setShowAddTaskModal(false)}
            className="custom-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>Add New Task</Modal.Title>
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
              <Button
                variant="secondary"
                onClick={() => setShowAddTaskModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddTask}>
                Add Task
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Todo;
