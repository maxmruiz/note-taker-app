// Initialize elements if on the notes page
let noteTitle = document.querySelector('.note-title');
let noteText = document.querySelector('.note-textarea');
let saveNoteBtn = document.querySelector('.save-note');
let newNoteBtn = document.querySelector('.new-note');
let clearNoteBtn = document.querySelector('.clear-note');
let noteList = document.querySelector('.list-container .list-group');

// Function to show an element
const show = (elem) => {
    elem.style.display = 'inline';
};

// Function to hide an element
const hide = (elem) => {
    elem.style.display = 'none';
};

// Object to keep track of the currently active note
let activeNote = {};

// Function to fetch notes from the server
const getNotes = () => fetch('/api/notes', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to save a note to the server
const saveNote = (note) => fetch('/api/notes', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
});

// Function to delete a note from the server
const deleteNote = (id) => fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
    },
});
// Function to render the active note in the UI
const renderActiveNote = () => {
    if (activeNote.id) {
        noteTitle.setAttribute('readonly', true);
        noteText.setAttribute('readonly', true);
        noteTitle.value = activeNote.title;
        noteText.value = activeNote.text;
        hide(saveNoteBtn);
        hide(clearNoteBtn);
    } else {
        noteTitle.removeAttribute('readonly');
        noteText.removeAttribute('readonly');
        noteTitle.value = '';
        noteText.value = '';
        hide(saveNoteBtn);
        show(clearNoteBtn);
    }
};

// Function to handle note selection
const handleNoteClick = (e) => {
    e.preventDefault();
    if (e.target.matches('.list-group-item')) {
        activeNote = JSON.parse(e.target.getAttribute('data-note'));
        renderActiveNote();
    } else if (e.target.matches('.delete-note')) {
        const noteId = e.target.parentNode.getAttribute('data-note-id');
        deleteNote(noteId).then(() => {
            getAndRenderNotes();
        });
    }
};

// Function to handle saving of a new note
const handleNoteSave = () => {
    const newNote = {
        title: noteTitle.value,
        text: noteText.value,
        id: activeNote ? activeNote.id : undefined, // If activeNote has an id, it's an update
    };
    saveNote(newNote).then(() => {
        getAndRenderNotes();
        activeNote = null;
        renderActiveNote();
    });
};

// Function to handle the viewing of a note from the list
const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
    renderActiveNote();
};

// Function to handle the creation of a new note view
const handleNewNoteView = () => {
    activeNote = {};
    renderActiveNote();
};

// Function to handle the visibility of the save button
const handleRenderSaveBtn = () => {
    if (!noteTitle.value.trim() || !noteText.value.trim()) {
        hide(saveNoteBtn);
    } else {
        show(saveNoteBtn);
    }
};

// Function to handle clearing the note form
const handleClearForm = () => {
    noteTitle.value = '';
    noteText.value = '';
    hide(saveNoteBtn);
    hide(clearNoteBtn);
};

// Function to create a list item for each note
const createNoteListItem = (note) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');
    liEl.innerText = note.title;
    liEl.setAttribute('data-note', JSON.stringify(note));
    liEl.addEventListener('click', handleNoteClick);

    const delBtnEl = document.createElement('i');
    delBtnEl.classList.add('fas', 'fa-trash-alt', 'delete-note');
    delBtnEl.setAttribute('data-note-id', note.id);
    liEl.appendChild(delBtnEl);

    return liEl;
};

// Function to render the list of notes in the UI
const renderNoteList = (notes) => {
    noteList.innerHTML = '';
    notes.forEach((note) => {
        const noteListItem = createNoteListItem(note);
        noteList.appendChild(noteListItem);
    });
};

// Function to get notes and render them
const getAndRenderNotes = () => {
    getNotes().then(response => response.json()).then(renderNoteList);
};

// Add event listeners if on the notes page
saveNoteBtn.addEventListener('click', handleNoteSave);
newNoteBtn.addEventListener('click', handleNewNoteView);
clearNoteBtn.addEventListener('click', handleClearForm);
noteTitle.addEventListener('keyup', handleRenderSaveBtn);
noteText.addEventListener('keyup', handleRenderSaveBtn);

// Initial call to get and render notes
getAndRenderNotes();