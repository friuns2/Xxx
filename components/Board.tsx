import React from 'react';
import { BoardState, Player } from '../types';
import { PLAYER_X_COLOR, PLAYER_O_COLOR } from '../constants';

interface BoardProps {
  board: BoardState;
  onSquareClick: (index: number) => void;
  winningLine: number[] | null;
  disabled: boolean;
}

export const Board: React.FC<BoardProps> = ({ board, onSquareClick, winningLine, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {board.map((square, index) => {
        const isWinningSquare = winningLine?.includes(index);
        const textColor = square === Player.X ? PLAYER_X_COLOR : square === Player.O ? PLAYER_O_COLOR : '';
        
        return (
          <button
            key={index}
            onClick={() => onSquareClick(index)}
            disabled={disabled || square !== null}
            className={`
              h-24 w-24 sm:h-32 sm:w-32 rounded-xl text-5xl sm:text-6xl font-bold flex items-center justify-center
              transition-all duration-200 ease-in-out shadow-lg
              ${
                square === null
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-slate-800'
              }
              ${isWinningSquare ? 'ring-4 ring-green-400 bg-slate-900 scale-105' : ''}
              ${textColor}
              ${square === Player.X ? 'glow-x' : ''}
              ${square === Player.O ? 'glow-o' : ''}
              disabled:cursor-not-allowed
            `}
          >
            {square}
          </button>
        );
      })}
    </div>
  );
};