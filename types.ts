
export interface DetectedStudent {
  id: string;
  name: string;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-1000 scale
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  PROCESSING = 'PROCESSING',
  LIST_READY = 'LIST_READY',
  PICKING = 'PICKING',
  RESULT = 'RESULT'
}
