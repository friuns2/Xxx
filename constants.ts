import { Player } from './types';

export const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const INITIAL_BOARD = Array(9).fill(null);

export const PLAYER_X_COLOR = 'text-blue-500';
export const PLAYER_O_COLOR = 'text-pink-500';
export const DRAW_COLOR = 'text-gray-400';
