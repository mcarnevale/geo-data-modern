# Plutonomics project rules

## Source of truth
Always follow:
- docs/product-brief.md
- docs/ui-system1-style.md

If there is a conflict between existing code and the docs, prefer the docs and propose changes.

## UI constraints
- System 1 inspired monochrome UI, window chrome, menus, dialogs.
- Time is always the x-axis.
- Avoid multi-axis overlays that mix incompatible units in one plot.
- Prefer "tracks" (stacked bands) with independent y-scales.
- Wealth Distribution track is always present on new canvases and pinned by default.

## Core objects
Use consistent naming:
- Model, Tile, Track, Canvas, Scene, Pin, Annotation

## Engineering constraints
- TypeScript everywhere.
- Prefer small, composable components.
- Keep state predictable and serializable for saving Scenes.
- No heavy abstractions in v1.