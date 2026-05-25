const storageKey = "minipad.notes.v2";

const elements = {
  addNote: document.getElementById("add-note"),
  clearNotes: document.getElementById("clear-notes"),
  noteCount: document.getElementById("note-count"),
  notesGrid: document.getElementById("notes-grid"),
  noteTemplate: document.getElementById("note-template"),
  saveState: document.getElementById("save-state"),
  search: document.getElementById("search-notes")
};

const nowIso = () => new Date().toISOString();

const createId = () => {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const formatUpdatedAt = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Edited recently";
  }

  return `Edited ${date.toLocaleString([], {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short"
  })}`;
};

const normalizeNote = (note, index) => ({
  id: note.id || createId(),
  title: typeof note.title === "string" ? note.title : `Note ${index + 1}`,
  body: typeof note.body === "string" ? note.body : "",
  updatedAt: typeof note.updatedAt === "string" ? note.updatedAt : nowIso()
});

const loadNotes = () => {
  try {
    const raw = localStorage.getItem(storageKey);

    if (!raw) {
      return [
        {
          id: createId(),
          title: "Welcome note",
          body: "Use MiniPad for quick ideas, checklists, and reminders. Your notes are saved automatically in this browser.",
          updatedAt: nowIso()
        }
      ];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeNote);
  } catch (error) {
    console.error("Failed to load notes", error);
    return [];
  }
};

const state = {
  notes: loadNotes(),
  query: ""
};

const setSaveState = (message) => {
  elements.saveState.textContent = message;
};

const saveNotes = () => {
  localStorage.setItem(storageKey, JSON.stringify(state.notes));
  setSaveState("Saved");
};

const scheduleSave = (() => {
  let timeoutId;

  return () => {
    setSaveState("Saving...");
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(saveNotes, 180);
  };
})();

const getFilteredNotes = () => {
  const query = state.query.trim().toLowerCase();

  if (!query) {
    return state.notes;
  }

  return state.notes.filter((note) => {
    const haystack = `${note.title} ${note.body}`.toLowerCase();
    return haystack.includes(query);
  });
};

const syncSummary = (visibleCount) => {
  elements.noteCount.textContent = String(visibleCount);
};

const render = () => {
  const notes = getFilteredNotes();
  const hasQuery = state.query.trim().length > 0;

  elements.notesGrid.textContent = "";
  syncSummary(notes.length);

  if (state.notes.length === 0) {
    const placeholder = document.createElement("p");
    placeholder.className = "notes-grid__empty";
    placeholder.textContent = "No notes yet. Create a new note to get started.";
    elements.notesGrid.appendChild(placeholder);
    return;
  }

  if (notes.length === 0 && hasQuery) {
    const placeholder = document.createElement("p");
    placeholder.className = "notes-grid__empty notes-grid__empty--search";
    placeholder.textContent = `No matching notes for "${state.query.trim()}".`;
    elements.notesGrid.appendChild(placeholder);
    return;
  }

  const fragment = document.createDocumentFragment();

  notes.forEach((note) => {
    const instance = elements.noteTemplate.content.cloneNode(true);
    const card = instance.querySelector(".note-card");
    const title = instance.querySelector(".note-card__title");
    const body = instance.querySelector(".note-card__body");
    const updatedAt = instance.querySelector('[data-role="updated-at"]');
    const characterCount = instance.querySelector('[data-role="character-count"]');
    const deleteButton = instance.querySelector('[data-action="delete"]');

    card.dataset.noteId = note.id;
    title.value = note.title;
    body.value = note.body;
    updatedAt.textContent = formatUpdatedAt(note.updatedAt);
    characterCount.textContent = `${note.body.length} chars`;
    deleteButton.dataset.noteId = note.id;

    fragment.appendChild(instance);
  });

  elements.notesGrid.appendChild(fragment);
};

const focusNote = (noteId) => {
  const titleField = elements.notesGrid.querySelector(`[data-note-id="${noteId}"] .note-card__title`);

  if (titleField) {
    titleField.focus();
    titleField.select();
  }
};

const createNote = () => {
  const nextNote = {
    id: createId(),
    title: `Note ${state.notes.length + 1}`,
    body: "",
    updatedAt: nowIso()
  };

  state.notes = [nextNote, ...state.notes];
  render();
  scheduleSave();
  focusNote(nextNote.id);
};

const updateNote = (noteId, field, value) => {
  state.notes = state.notes.map((note) => {
    if (note.id !== noteId) {
      return note;
    }

    return {
      ...note,
      [field]: value,
      updatedAt: nowIso()
    };
  });
  scheduleSave();
};

const deleteNote = (noteId) => {
  state.notes = state.notes.filter((note) => note.id !== noteId);
  render();
  scheduleSave();
};

elements.addNote.addEventListener("click", createNote);

elements.clearNotes.addEventListener("click", () => {
  if (state.notes.length === 0) {
    return;
  }

  if (!window.confirm("Delete every note from this browser?")) {
    return;
  }

  state.notes = [];
  render();
  scheduleSave();
});

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const hasMeta = event.ctrlKey || event.metaKey;
  const hasAlt = event.altKey;

  if (hasMeta && hasAlt && key === "n") {
    event.preventDefault();
    createNote();
    return;
  }

  if (hasMeta && key === "k") {
    event.preventDefault();
    elements.search.focus();
    elements.search.select();
    return;
  }

  if (event.key === "Escape" && state.query.trim().length > 0) {
    state.query = "";
    elements.search.value = "";
    render();
  }
});

elements.notesGrid.addEventListener("input", (event) => {
  const card = event.target.closest(".note-card");

  if (!card) {
    return;
  }

  const field = event.target.classList.contains("note-card__title") ? "title" : "body";
  updateNote(card.dataset.noteId, field, event.target.value);

  const note = state.notes.find((item) => item.id === card.dataset.noteId);

  if (!note) {
    return;
  }

  card.querySelector('[data-role="updated-at"]').textContent = formatUpdatedAt(note.updatedAt);
  card.querySelector('[data-role="character-count"]').textContent = `${note.body.length} chars`;
});

elements.notesGrid.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action='delete']");

  if (!trigger) {
    return;
  }

  if (!window.confirm("Delete this note?")) {
    return;
  }

  deleteNote(trigger.dataset.noteId);
});

window.addEventListener("beforeunload", saveNotes);

render();
setSaveState("Saved locally");
