export enum Player {
  X = 'X',
  O = 'O',
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
}

export enum GameMode {
  PVP = 'PvP',
  AI = 'AI',
}

export interface MoveResult {
  index: number;
  comment: string;
}

export type BoardState = (Player | null)[];

export interface WinningLine {
  line: number[];
  winner: Player;
}