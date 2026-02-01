/** Common shape for tile data API responses (multi-series, aligned by date). */
export interface TileDataMeta {
  units?: string;
  frequency?: string;
  /** Series key -> display label for legend */
  series: Record<string, string>;
}

export interface TileDataRow {
  date: string;
  [key: string]: string | number | null | undefined;
}

export interface TileDataPayload {
  meta: TileDataMeta;
  data: TileDataRow[];
}
