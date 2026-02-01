import type { Model, Tile } from "./types";

const placeholderTiles: Tile[] = [
  { id: "wealth-distribution", name: "Wealth Distribution", description: "Distribution of wealth over time; shared across models.", dataSource: "DFA via FRED (from 1989)" },
  { id: "tile-2", name: "Tile 2", description: "Second placeholder tile for this model." },
  { id: "tile-3", name: "Tile 3", description: "Third placeholder tile for this model." },
];

export interface PrototypeModel extends Model {
  tiles: Tile[];
}

function model(id: string, name: string, description: string): PrototypeModel {
  return { id, name, description, tiles: [...placeholderTiles] };
}

export const prototypeModels: PrototypeModel[] = [
  model("generational-theory", "Generational Theory", "Explores how generational cycles shape economic and social outcomes."),
  model("wealth-success-talent", "Wealth, Success & Talent", "Examines the relationship between wealth accumulation, success metrics, and talent distribution."),
  model("end-times", "End Times", "Placeholder for long-term and tail-risk economic narratives."),
  model("middle-income-trap", "The Middle Income Trap", "Analyzes why some economies stall after reaching middle-income status."),
  model("economic-machine", "The Economic Machine", "A simplified view of how the economy operates as a system."),
  model("capital-21st-century", "Capital in the 21st Century", "Placeholder for inequality and capital concentration themes."),
  model("great-rebalancing", "The Great Rebalancing", "Placeholder for global rebalancing and shift narratives."),
  model("great-leveler", "The Great Leveler", "Placeholder for inequality and leveling forces over history."),
  model("post-global-prosperity", "Post Global Prosperity", "Placeholder for post-globalization prosperity and distribution."),
];
