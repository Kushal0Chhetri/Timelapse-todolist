import express from 'express';          // For creating the Express server
import pg from 'pg';                    // PostgreSQL client
import dotenv from 'dotenv';            // To manage environment variables
import cors from 'cors';                // To handle Cross-Origin Resource Sharing
import fs from 'fs/promises';
import { createReadStream } from 'fs';  // Import regular fs for streaming
import path from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

// Load environment variables
dotenv.config();

const app = express();
const port = 3000; // Server will run on port 3000 by default

const VIDEO_DIRECTORY = '/Users/arnavjagtap/Documents/TimeLapseVideo/Time-lapse Videos/';

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
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
// Post request to add files to the database
app.post('/add-file', async (req, res) => {
    const { taskId, fileName, fileLocation, softwareName } = req.body;

    // Enhanced validation
    if (!fileName || !taskId) {
        console.log('Received invalid data:', { fileName, fileLocation, taskId, softwareName });
        return res.status(400).json({
            error: 'Missing required fields',
            received: { fileName, fileLocation, taskId, softwareName }
        });
    }

    try {
        const query = `
            INSERT INTO files (file_name, file_location, task_id, software_name)
            VALUES ($1, $2, $3, $4)
            RETURNING file_id, file_name, file_location, task_id, software_name;
        `;
        
        // Use a default location if none provided
        const location = fileLocation || 'default-location';
        const values = [fileName, location, taskId, softwareName || null];
        
        console.log('Executing query with values:', values);
        
        const result = await taskDatabase.query(query, values);
        console.log('File added successfully:', result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding file:', err);
        res.status(500).json({
            error: 'Failed to add file',
            details: err.message
        });
    }
});

// Get files for a specific task
app.get('/get-files/:taskId', async (req, res) => {
    const { taskId } = req.params;

    try {
        const query = `
            SELECT 
                file_id as id,
                file_name as "fileName",
                file_location as location,
                software_name as "softwareName"
            FROM files
            WHERE task_id = $1
            ORDER BY file_id ASC;
        `;
        const result = await taskDatabase.query(query, [taskId]);
        
        // If no files found, return empty array instead of error
        if (result.rows.length === 0) {
            return res.json([]);
        }
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching files:', err);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Update a file
app.put('/update-file/:fileId', async (req, res) => {
    const { fileId } = req.params;
    const { fileName, fileLocation, softwareName } = req.body;

    try {
        const query = `
            UPDATE files 
            SET 
                file_name = COALESCE($1, file_name),
                file_location = COALESCE($2, file_location),
                software_name = COALESCE($3, software_name)
            WHERE file_id = $4
            RETURNING *;
        `;
        const values = [fileName, fileLocation, softwareName, fileId];
        const result = await taskDatabase.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating file:', err);
        res.status(500).json({ error: 'Failed to update file' });
    }
});

// Delete a file
app.delete('/delete-file/:fileId', async (req, res) => {
    const { fileId } = req.params;
    console.log('Attempting to delete file with ID:', fileId);

    try {
        const query = `
            DELETE FROM files
            WHERE file_id = $1
            RETURNING *;
        `;
        console.log('Executing query with fileId:', fileId);
        const result = await taskDatabase.query(query, [fileId]);
        console.log('Query result:', result.rows);

        if (result.rows.length === 0) {
            console.log('No file found with ID:', fileId);
            return res.status(404).json({ error: 'File not found' });
        }

        console.log('File deleted successfully:', result.rows[0]);
        res.json({ message: 'File deleted successfully', deletedFile: result.rows[0] });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to delete file', details: err.message });
    }
});

app.get('/get-videos', async (req, res) => {
    try {
        // First check if directory exists
        try {
            await fs.access(VIDEO_DIRECTORY);
        } catch (err) {
            console.error('Directory not accessible:', err);
            return res.status(404).json({ 
                error: 'Video directory not found',
                path: VIDEO_DIRECTORY 
            });
        }

        const files = await fs.readdir(VIDEO_DIRECTORY);
        console.log('Files found in directory:', files);

        // Filter for MP4 files
        const videoFiles = files.filter(file => file.toLowerCase().endsWith('.mp4'));
        console.log('MP4 files found:', videoFiles);

        // Process each video file
        const videos = await Promise.all(videoFiles.map(async (file, index) => {
            try {
                const filePath = path.join(VIDEO_DIRECTORY, file);
                const stats = await fs.stat(filePath);

                return {
                    id: index + 1,
                    title: file.replace('.mp4', ''),
                    src: `http://localhost:3000/video/${encodeURIComponent(file)}`,
                    duration: "00:00", // We'll handle duration later
                    StartTime: stats.birthtime.toISOString(),
                    EndTime: "null",
                    screenshots: {},
                    fileName: file
                };
            } catch (err) {
                console.error(`Error processing video ${file}:`, err);
                return null;
            }
        }));

        // Filter out any null entries and send response
        const validVideos = videos.filter(video => video !== null);
        console.log('Sending videos:', validVideos);
        res.json(validVideos);

    } catch (error) {
        console.error('Error in /get-videos:', error);
        res.status(500).json({ 
            error: 'Failed to get videos',
            details: error.message
        });
    }
});

// Video streaming endpoint
app.get('/video/:filename', async (req, res) => {
    try {
        const videoPath = path.join(VIDEO_DIRECTORY, req.params.filename);
        
        // Check if file exists
        try {
            await fs.access(videoPath);
        } catch (err) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Get video stats
        const stat = await fs.stat(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // Handle range request for video streaming
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const stream = createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(206, head);
            stream.pipe(res);
        } else {
            // Handle non-range request
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).json({ error: 'Failed to stream video' });
    }
});

// Serve static files (optional, if you need it)
app.get('/videos/:filename', async (req, res) => {
    try {
        const videoPath = path.join(VIDEO_DIRECTORY, req.params.filename);
        const stream = createReadStream(videoPath);
        stream.pipe(res);
    } catch (error) {
        console.error('Error serving video file:', error);
        res.status(500).json({ error: 'Failed to serve video file' });
    }
});

// This API call retrieves the correct output json file associated 
// with a video from the user's Output JSON directory
app.get('/get-video-metadata/:date', async (req, res) => {
    const { date } = req.params;
    const metadataPath = `/Users/arnavjagtap/Documents/TimeLapseVideo/Output JSON/output_${date}.json`;
    
    console.log('Attempting to read metadata from:', metadataPath);

    try {
        // Check if file exists first
        if (!existsSync(metadataPath)) {
            console.log('File not found:', metadataPath);
            return res.status(404).json({ 
                error: 'Metadata file not found',
                path: metadataPath 
            });
        }

        const data = await readFile(metadataPath, 'utf8');
        console.log('Successfully read metadata file');

        try {
            const metadata = JSON.parse(data);
            console.log('Successfully parsed JSON data');
            res.json(metadata);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).json({ 
                error: 'Failed to parse metadata file',
                details: parseError.message 
            });
        }
    } catch (error) {
        console.error('Error reading metadata file:', error);
        res.status(500).json({ 
            error: 'Failed to load metadata',
            details: error.message 
        });
    }
});

// Starting the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
