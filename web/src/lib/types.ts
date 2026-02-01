export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface Tile {
  id: string;
  name: string;
  description: string;
  /** Optional data source label (e.g. "DFA via FRED (from 1989)") */
  dataSource?: string;
}

export interface Track {
  id: string;
  modelId: string;
  modelName: string;
  tileId: string;
  tileName: string;
}

export interface Scene {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
}

export interface TileSet {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
}

export type SaveStatus = "Saved" | "Saving..." | "Not saved";
