import express from 'express';          // For creating the Express server
import pg from 'pg';                    // PostgreSQL client
import dotenv from 'dotenv';            // To manage environment variables
import cors from 'cors';                // To handle Cross-Origin Resource Sharing

// Load environment variables
dotenv.config();

const app = express();
const port = 3000; // Server will run on port 3000 by default

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON requests

// Create PostgreSQL client
// Use .env to store sensitive info
const { Pool } = pg;
const taskDatabase = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// Post request to add task to the taskDatabase
app.post('/add-task', async (req, res) => {
    const { task_id, taskName, dueDate } = req.body;
    try {
        const newTask = await taskDatabase.query(
            "INSERT INTO tasks (task_id, task_name, due_date) VALUES ($1, $2, $3) RETURNING *",
            [task_id, taskName, dueDate]
        );
        res.json(newTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


// Delete request to remove task from the taskDatabase
app.delete('/delete-task', async (req, res) => {
    const { taskId } = req.body; // Read taskId from the request body
    try {
        // Delete the task where task_id matches the provided id
        const deletedTask = await taskDatabase.query(
            "DELETE FROM tasks WHERE task_id = $1",
            [taskId]
        );

        if (deletedTask.rowCount === 0) {
            return res.status(404).json({ msg: "Task not found" });
        }

        res.json(deletedTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Put request to edit an existing task in the database
app.put('/update-task', async (req, res) => {
    const { taskId, taskName, dueDate } = req.body;
    try {
        const updatedTask = await taskDatabase.query(
            "UPDATE tasks SET task_name = $2, due_date = $3 WHERE task_id = $1 RETURNING *",
            [taskId, taskName, dueDate]
        );

        if (updatedTask.rows.length === 0) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        res.json(updatedTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Get request to fetch tasks from the database
app.get('/get-tasks', async (req, res) => {
    try {
        const allTasks = await taskDatabase.query("SELECT * FROM tasks ORDER BY due_date");
        res.json(allTasks.rows); // Send the list of tasks as a JSON response
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Post request to add files to the database and link it to the task
app.post('/add-file', async (req, res) => {
    const { fileName, fileLocation, taskId } = req.body;

    try {
        const query = `
        INSERT INTO files (file_name, file_location, task_id)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
        const values = [fileName, fileLocation, taskId];
        const result = await taskDatabase.query(query, values);

        res.json(result.rows[0]); // Return the newly added file
    } catch (err) {
        console.error('Error adding file:', err);
        res.status(500).json({ error: 'Failed to add file' });
    }
});

// Get files from the database for a specific task
app.get('/get-files/:taskId', async (req, res) => {
    const { taskId } = req.params;

    try {
        const query = `
        SELECT * FROM files
        WHERE task_id = $1;
      `;
        const result = await taskDatabase.query(query, [taskId]);
        console.log("Result: ", result.rows[0]);
        res.json(result.rows); // Return the files for the task
    } catch (err) {
        console.error('Error fetching files:', err);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Delete a particular file of a task
app.delete('/delete-file/:fileId', async (req, res) => {
    const { fileId } = req.params;

    try {
        const query = `
        DELETE FROM files
        WHERE file_id = $1;
      `;
        await taskDatabase.query(query, [fileId]);

        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});


// Starting the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
