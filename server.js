const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Path to db.json file
const dbPath = path.join(__dirname, 'db', 'db.json');

// Function to read notes from db.json
function readNotes() {
    return new Promise((resolve, reject) => {
        fs.readFile(dbPath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

// Function to write notes to db.json
function writeNotes(notes) {
    return new Promise((resolve, reject) => {
        fs.writeFile(dbPath, JSON.stringify(notes, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// GET route for fetching notes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await readNotes();
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: "Failed to read notes" });
    }
});

// POST route to save a note
app.post('/api/notes', async (req, res) => {
    try {
        const newNote = req.body;
        const notes = await readNotes();
        notes.push(newNote); // Add the new note to the array
        await writeNotes(notes);
        res.json({ message: 'Note saved successfully' });
    } catch (err) {
        res.status(500).json({ message: "Failed to save note" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
