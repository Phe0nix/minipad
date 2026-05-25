# MiniPad

MiniPad is a lightweight note board for quick thoughts, reminders, and short drafting.

## Features

- Responsive single-page layout with a modern card-based workspace
- Instant note creation, inline editing, and delete actions
- Search notes by title or content
- Search no-match feedback in the notes grid
- Empty-grid message after clearing all notes
- Automatic local persistence with `localStorage`
- Save status feedback and visible-note count

## Keyboard shortcuts

- `Ctrl/Cmd + Alt + N`: Create a new note
- `Ctrl/Cmd + K`: Focus search
- `Esc`: Clear active search

## Data model

Each note stores:

- `id`
- `title`
- `body`
- `updatedAt`

Notes are stored in local storage under the key `minipad.notes.v2`.

## Demo

[Live demo](https://phe0nix.github.io/minipad)
