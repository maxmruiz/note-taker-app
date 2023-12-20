// Define variables to store DOM elements
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
    hide(clearNoteBtn);
    if (activeNote.id) {
        noteTitle.setAttribute('readonly', true);
        noteText.setAttribute('readonly', true);
        noteTitle.value = activeNote.title;
        noteText.value = activeNote.text;
    } else {
        noteTitle.removeAttribute('readonly');
        noteText.removeAttribute('readonly');
        noteTitle.value = '';
        noteText.value = '';
    }
    handleRenderSaveBtn();
};

// Function to handle note selection and deletion
noteList.addEventListener('click', (e) => {
    e.preventDefault();
    const selectedElement = e.target;
    const selectedNote = JSON.parse(selectedElement.closest('.list-group-item').getAttribute('data-note'));

    if (selectedElement.matches('.delete-note')) {
        const noteId = selectedNote.id;
        deleteNote(noteId).then(() => {
            getAndRenderNotes();
        });
    } else {
        activeNote = selectedNote;
        renderActiveNote();
    }
});

// Function to handle saving of a new note
const handleNoteSave = () => {
    const newNote = {
        title: noteTitle.value,
        text: noteText.value,
        id: activeNote.id || undefined
    };
    saveNote(newNote).then(() => {
        getAndRenderNotes();
        activeNote = {};
        renderActiveNote();
    });
};

// Function to handle the visibility of the save button
const handleRenderSaveBtn = () => {
    if (noteTitle.value.trim() || noteText.value.trim()) {
        show(saveNoteBtn);
    } else {
        hide(saveNoteBtn);
    }
};

// Function to handle the creation of a new note view
const handleNewNoteView = () => {
    activeNote = {};

    noteTitle.value = '';
    noteText.value = '';

    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');

    hide(saveNoteBtn);
    hide(clearNoteBtn);

    noteTitle.focus();
};


// Function to handle clearing the note form
const handleClearForm = () => {
    activeNote = {};
    renderActiveNote();
};

// Function to create a list item for each note
const createNoteListItem = (note) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');
    liEl.setAttribute('data-note', JSON.stringify(note));
    
    const textSpan = document.createElement('span');
    textSpan.classList.add('list-item-title');
    textSpan.innerText = note.title;
    liEl.appendChild(textSpan);

    const delBtnEl = document.createElement('i');
    delBtnEl.classList.add('fas', 'fa-trash-alt', 'delete-note');
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

// Event listeners
noteTitle.addEventListener('input', handleRenderSaveBtn);
noteText.addEventListener('input', handleRenderSaveBtn);
saveNoteBtn.addEventListener('click', handleNoteSave);
clearNoteBtn.addEventListener('click', handleClearForm);
newNoteBtn.addEventListener('click', handleNewNoteView);

// Initial call to get and render notes
getAndRenderNotes();
