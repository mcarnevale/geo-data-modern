# Plutonomics
A web app for exploring geopolitical and macroeconomic models through narrative, time-based data overlays.

## Core idea
Users assemble a timeline workspace (Canvas) by adding data tiles (Tracks) from different models, then save compositions as Scenes. Time is always the x-axis.

## Visual style
Classic Mac OS System 1 inspired UI:
- Monochrome palette
- Pixel-style icons
- Chicago-like bitmap typography feel
- Window chrome, title bars, menus, dialogs
- Desktop metaphor: files, folders, windows

## Information architecture
- Left sidebar window: folder "PLUTONOMICS" containing model files
- Workspace items in the same sidebar: Canvas, Scenes, Tile Sets
- Primary windows:
  - Model Window: description, tiles list, add-to-canvas actions
  - Canvas Window: timeline with stacked Tracks
  - Inspector Window: settings for selected Track
  - Sources Window: citations and dataset links

## Shared attributes
All models share a Wealth Distribution tile.
- Wealth Distribution is always present on a new Canvas
- Wealth Distribution is pinned by default
- Wealth Distribution uses Fed DFA as the canonical source

## Interaction model
- Add tiles to Canvas via click-to-add or drag into Canvas
- Canvas shows Tracks aligned by time
- Tracks can be reordered, hidden, pinned
- Hover shows a vertical time cursor and values per Track
- Users can drop pins and annotations at specific times
- Scenes save the Track set, ordering, settings, time range, pins, annotations

## Modes
- Stack Mode: Tracks as vertical bands aligned to time, each with its own y-scale
- Compare Mode: small multiples aligned by time for pattern comparison

## Narrative first
The app supports storytelling:
- Scenes act like chapters
- Pins and annotations support narrative beats
- Sources are always available for credibility

## Non-goals for v1
- Freeform chart builders
- Multi-axis overlays that cram incompatible units into one plot
- Too many transforms or knobs
- Heavy AI narration inside the UI

## Tech intent (draft)
- Web app
- Git repo
- Vercel deploy
- Supabase for auth and saving workspaces