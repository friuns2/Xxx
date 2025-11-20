import React, { useState, useEffect, useCallback } from 'react';
import { Board } from './components/Board';
import { getAiMove } from './services/geminiService';
import { Player, GameStatus, GameMode, BoardState, WinningLine } from './types';
import { WINNING_COMBINATIONS, INITIAL_BOARD, PLAYER_X_COLOR, PLAYER_O_COLOR } from './constants';

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.X);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [mode, setMode] = useState<GameMode>(GameMode.AI);
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiComment, setAiComment] = useState<string>("I'm ready when you are.");

  const checkWinner = useCallback((currentBoard: BoardState): WinningLine | 'Draw' | null => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { line: combo, winner: currentBoard[a] as Player };
      }
    }
    if (!currentBoard.includes(null)) return 'Draw';
    return null;
  }, []);

  const handleSquareClick = async (index: number) => {
    if (board[index] || status === GameStatus.FINISHED || isAiThinking) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setStatus(GameStatus.PLAYING);

    const result = checkWinner(newBoard);

    if (result) {
      endGame(result);
    } else {
      const nextPlayer = currentPlayer === Player.X ? Player.O : Player.X;
      setCurrentPlayer(nextPlayer);
    }
  };

  // AI Turn Effect
  useEffect(() => {
    const makeAiMove = async () => {
      if (mode === GameMode.AI && currentPlayer === Player.O && status === GameStatus.PLAYING) {
        setIsAiThinking(true);
        try {
          const { index, comment } = await getAiMove(board, Player.O);
          
          setAiComment(comment);
          
          setBoard((prev) => {
            const newBoard = [...prev];
            // Ensure the move is valid (safety check)
            if (newBoard[index] === null) {
                newBoard[index] = Player.O;
            } else {
                // Fallback for collision
                const openSpot = newBoard.indexOf(null);
                if (openSpot !== -1) newBoard[openSpot] = Player.O;
            }
            
            const result = checkWinner(newBoard);
            if (result) {
              endGame(result);
            } else {
              setCurrentPlayer(Player.X);
            }
            return newBoard;
          });
        } catch (e) {
          console.error("AI Move failed", e);
        } finally {
          setIsAiThinking(false);
        }
      }
    };

    makeAiMove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, mode, status]); // board dependency removed to avoid recursion, handled via refs/state logic if needed, but here simple flow works.

  const endGame = (result: WinningLine | 'Draw') => {
    setStatus(GameStatus.FINISHED);
    if (result === 'Draw') {
      setWinner('Draw');
    } else {
      setWinner(result.winner);
      setWinningLine(result.line);
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer(Player.X);
    setStatus(GameStatus.IDLE);
    setWinner(null);
    setWinningLine(null);
    setAiComment(mode === GameMode.AI ? "Let's go again!" : "");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 mb-2 tracking-tighter">
          TIM TAKE TOE
        </h1>
        <p className="text-slate-400 font-mono text-sm">Powered by Gemini 2.5 Flash</p>
      </header>

      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Game Controls */}
        <div className="flex space-x-4 mb-8 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => { setMode(GameMode.AI); resetGame(); }}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${mode === GameMode.AI ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            VS Gemini
          </button>
          <button
            onClick={() => { setMode(GameMode.PVP); resetGame(); }}
            className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors ${mode === GameMode.PVP ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            2 Player
          </button>
        </div>

        {/* Status Bar */}
        <div className="h-12 mb-4 flex items-center justify-center">
           {status === GameStatus.FINISHED ? (
             <div className="text-2xl font-bold animate-bounce">
               {winner === 'Draw' ? (
                 <span className="text-gray-400">Draw!</span>
               ) : (
                 <>
                   <span className={winner === Player.X ? PLAYER_X_COLOR : PLAYER_O_COLOR}>
                     {winner}
                   </span> WINS!
                 </>
               )}
             </div>
           ) : (
             <div className="flex items-center space-x-2">
                <span className="text-slate-400">Turn:</span>
                <span className={`text-xl font-bold ${currentPlayer === Player.X ? PLAYER_X_COLOR : PLAYER_O_COLOR}`}>
                  {currentPlayer}
                </span>
                {isAiThinking && <span className="text-xs text-pink-400 ml-2 animate-pulse">Thinking...</span>}
             </div>
           )}
        </div>

        {/* Main Board */}
        <Board 
          board={board} 
          onSquareClick={handleSquareClick} 
          winningLine={winningLine}
          disabled={status === GameStatus.FINISHED || isAiThinking}
        />

        {/* AI Chat Bubble */}
        <div className={`
            w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 min-h-[80px]
            transition-opacity duration-500
            ${mode === GameMode.AI ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
            <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">AI</span>
                </div>
                <div>
                    <p className="text-sm text-slate-300 italic">"{aiComment}"</p>
                </div>
            </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetGame}
          className="mt-8 px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default App;