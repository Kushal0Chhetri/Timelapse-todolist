import { useState } from "react";
import TaskHeader from "./Component/taskHeader";
import Task from "./Component/Tasks";
import { Modal, Button, Form } from "react-bootstrap";
import "./to-do.css";
import { Task as TaskType, File } from "./TaskData"; // Import only TaskType and File
import { useEffect } from "react"; // Add useEffect for fetching data
import TailwindDatePicker from './Component/TailwindDatePicker';

const Todo = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]); // Initialize tasks as an empty array
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]); // Store selected task IDs

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3000/get-tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const tasksData = await response.json();

        const formattedTasks = tasksData.map((task: any) => ({
          id: task.task_id,
          taskName: task.task_name,
          files: task.files || [], // Keep any existing files from the backend
          dueDate: new Date(task.due_date).toISOString(),
          completed: task.completed || false
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (newTaskName.trim() === "" || newDueDate.trim() === "") {
      alert("Please fill in all fields");
      return;
    }
    const newTaskId = Date.now(); // Generate task_id based on timestamp
    const newTask: TaskType = {
      id: newTaskId.toString(),
      taskName: newTaskName,
      files: [],
      dueDate: newDueDate,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    setShowAddTaskModal(false); // Close the modal
    setNewTaskName(""); // Clear the form
    setNewDueDate("");

    try {
      const response = await fetch('http://localhost:3000/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: newTaskId,
          taskName: newTaskName,
          dueDate: newDueDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const addedTask = await response.json();
      console.log("Task added successfully:", addedTask);
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task, please try again.");
    }
  };


  // Update the onUpdateFile function to use File
  const onUpdateFile = (taskId: string, updatedFile: File) => {
    setTasks(tasks.map((task) => {
      if (task.id === taskId) {
        const updatedFiles = task.files.map((file) =>
          file.id === updatedFile.id ? updatedFile : file
        );
        return { ...task, files: updatedFiles };
      }
      return task;
    }));
  };

  // Update onDeleteFile to include proper error handling
  const onDeleteFile = async (taskId: string, fileId: string) => {
    try {
        console.log('Attempting to delete file:', { taskId, fileId });
        
        const response = await fetch(`http://localhost:3000/delete-file/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId }),
        });

        // Even if we get a 404, the file is gone from the database
        // so we should update the UI regardless
        setTasks(prevTasks => 
            prevTasks.map(task => {
                if (task.id === taskId) {
                    return {
                        ...task,
                        files: task.files.filter(file => file.id !== fileId)
                    };
                }
                return task;
            })
        );

        if (!response.ok) {
            console.log('Backend reported file not found, but UI is updated');
        }

    } catch (error) {
        console.error('Error in delete operation:', error);
    }
};

  const onUpdateTask = async (
    taskId: string,
    updatedTask: { taskName: string; dueDate: string }
  ) => {
    try {
      const response = await fetch(`http://localhost:3000/update-task`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          ...updatedTask,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update task in frontend state if the backend update is successful
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      );
      setTasks(updatedTasks);
      console.log("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };


  // Update onAddFile to use FileInfo and include proper error handling
  const onAddFile = async (taskId: string, newFile: File) => {
    try {
      // Check for duplicates first
      const task = tasks.find(t => t.id === taskId);
      if (task?.files.some(f => f.fileName === newFile.fileName)) {
        alert('A file with this name already exists');
        return;
      }

      const fileData = {
        taskId,
        fileName: newFile.fileName,
        fileLocation: newFile.location,
        softwareName: newFile.softwareName
      };

      const response = await fetch('http://localhost:3000/add-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileData),
      });

      if (!response.ok) {
        throw new Error('Failed to add file');
      }

      const result = await response.json();

      // Update local state only after successful database update
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedFiles = [
              ...task.files,
              {
                id: result.file_id.toString(),
                fileName: result.file_name,
                location: result.file_location,
                softwareName: result.software_name || 'Unknown'
              }
            ];
            return { ...task, files: updatedFiles };
          }
          return task;
        })
      );
    } catch (error) {
      console.error('Error adding file:', error);
      alert('Failed to add file. Please try again.');
    }
  };

  const onDeleteTask = async (taskId: string) => {
    try {
      // Send DELETE request with taskId in the body
      console.log("Task ID when deleting = ", taskId);
      const response = await fetch(`http://localhost:3000/delete-task`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }), // Pass taskId in the body
      });

      if (!response.ok) {
        console.log('Failed to delete task');
      }
      else {
        console.log("Task deleted successfully");
      }

      // Filter out the deleted task from the tasks array
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task, please try again.");
    }
  };

  const handleCheckboxChange = (taskId: string, isChecked: boolean) => {
    setTasks((prevTasks) =>
      prevTasks
        .map((task) =>
          task.id === taskId ? { ...task, completed: isChecked } : task
        )
        .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
    );
  };


  const handleDeleteSelectedTasks = () => {
    const updatedTasks = tasks.filter((task) => !selectedTasks.includes(task.id));
    setTasks(updatedTasks);
    setSelectedTasks([]); // Clear selection after deletion
  };

  return (
    <div className="todo-container">
      <TaskHeader />

      <Button
        variant="primary"
        onClick={() => setShowAddTaskModal(true)}
        className="add-task-button mb-3"
      >
        <i className="fas fa-plus"></i> Add new task
      </Button>

      <main>
        <table id="tasks" className="table table-hover">
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
                onCheckboxChange={handleCheckboxChange} // Pass the checkbox handler
              />
            ))}
          </tbody>
        </table>
      </main>

      {selectedTasks.length > 0 && (
        <Button
          variant="danger"
          onClick={handleDeleteSelectedTasks}
          className="mt-3 delete-tasks-button"
        >
          Delete Selected Tasks
        </Button>
      )}

      {/* Modal for adding a new task */}
      {showAddTaskModal && (
        <>
          <div className="overlay" onClick={() => setShowAddTaskModal(false)} />
          <Modal
            show={showAddTaskModal}
            onHide={() => setShowAddTaskModal(false)}
            className="custom-modal"
          >
            <Modal.Header>
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
                  <TailwindDatePicker
                    id="dueDate"
                    value={newDueDate} // This should be a string in 'YYYY-MM-DD' format
                    onChange={(date) => setNewDueDate(date)} // Update state with the new date
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
