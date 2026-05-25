# MiniPad

MiniPad is a lightweight note board for quick thoughts, reminders, and short drafting.

## Features

- Responsive single-page layout with modern card-based note editing
- Create, edit, delete, and clear notes
- Instant search across note title and content
- In-grid feedback for empty state and no search matches
- Save status and visible note count indicators
- Light and dark theme toggle with persistence
- Keyboard shortcuts for fast note actions
- Local-first storage with automatic save

## Keyboard shortcuts

- `Ctrl/Cmd + Alt + N`: Create a new note
- `Ctrl/Cmd + K`: Focus search
- `Esc`: Clear active search

## Theme behavior

- Theme toggle button in the toolbar switches between light and dark mode.
- Theme selection is saved in local storage under `minipad.theme.v1`.
- If no saved theme exists yet, MiniPad follows the OS preference.

## Data model

Each note stores:

- id
- title
- body
- updatedAt

Notes are stored in local storage under the key `minipad.notes.v2`.

## Run locally

Open `index.html` in a browser.

## Demo

[Live demo](https://phe0nix.github.io/minipad)
