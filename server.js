const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.join(__dirname, 'db', 'db.json');

// Helper function to read notes from the db.json file
const readNotes = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(dbPath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
};

// Helper function to write notes to the db.json file
const writeNotes = (notes) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(dbPath, JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// GET endpoint to fetch all notes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await readNotes();
        res.json(notes);
    } catch (err) {
        res.status(500).json({ error: "Failed to read notes" });
    }
});

// POST endpoint to create a new note or update an existing note
app.post('/api/notes', async (req, res) => {
    const { title, text, id } = req.body;
    try {
        let notes = await readNotes();
        if (id) {
            // Update existing note
            notes = notes.map(note => note.id === id ? { title, text, id } : note);
        } else {
            // Create new note
            const newNote = { title, text, id: Date.now().toString() }; // Simple ID generation
            notes.push(newNote);
        }
        await writeNotes(notes);
        res.json({ message: "Note saved successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to save the note" });
    }
});

// DELETE endpoint to delete a note
app.delete('/api/notes/:id', async (req, res) => {
    const noteId = req.params.id;
    try {
        let notes = await readNotes();
        notes = notes.filter(note => note.id !== noteId);
        await writeNotes(notes);
        res.json({ message: "Note deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete the note" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
