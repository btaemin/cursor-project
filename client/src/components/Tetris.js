import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Tetris.css';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
  O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' }
};

const Tetris = ({ onClose }) => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const gameIntervalRef = useRef(null);
  const boardRef = useRef(board);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  function createEmptyBoard() {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  }

  function getRandomPiece() {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return {
      shape: TETROMINOS[randomPiece].shape,
      color: TETROMINOS[randomPiece].color
    };
  }

  function isValidMove(piece, position, board) {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = position.x + x;
          const newY = position.y + y;

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }

          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function placePiece(piece, position, board) {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = position.x + x;
          const newY = position.y + y;
          if (newY >= 0) {
            newBoard[newY][newX] = piece.color;
          }
        }
      }
    }
    return newBoard;
  }

  function rotatePiece(piece) {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  }

  function clearLines(board) {
    let newBoard = board.filter(row => row.some(cell => cell === 0));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    if (linesCleared > 0) {
      setLines(prev => prev + linesCleared);
      setScore(prev => prev + linesCleared * 100 * level);
      setLevel(prev => Math.floor((lines + linesCleared) / 10) + 1);
    }

    return newBoard;
  }

  const movePiece = useCallback((direction) => {
    if (!currentPiece || gameOver || isPaused) return;

    let newPosition = { ...currentPosition };
    
    if (direction === 'down') {
      newPosition.y += 1;
    } else if (direction === 'left') {
      newPosition.x -= 1;
    } else if (direction === 'right') {
      newPosition.x += 1;
    }

    if (isValidMove(currentPiece, newPosition, boardRef.current)) {
      setCurrentPosition(newPosition);
      return true;
    } else if (direction === 'down') {
      // Piece has landed
      const newBoard = placePiece(currentPiece, currentPosition, boardRef.current);
      const clearedBoard = clearLines(newBoard);
      setBoard(clearedBoard);

      // Check game over
      if (currentPosition.y <= 0) {
        setGameOver(true);
        if (gameIntervalRef.current) {
          clearInterval(gameIntervalRef.current);
        }
        return false;
      }

      // Spawn new piece
      const newPiece = getRandomPiece();
      setCurrentPiece(newPiece);
      setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
      return false;
    }
    return false;
  }, [currentPiece, currentPosition, gameOver, isPaused, lines]);

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    const rotatedPiece = rotatePiece(currentPiece);
    if (isValidMove(rotatedPiece, currentPosition, boardRef.current)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, currentPosition, gameOver, isPaused]);

  useEffect(() => {
    if (!gameOver && !isPaused) {
      const newPiece = getRandomPiece();
      setCurrentPiece(newPiece);
      setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    }
  }, []);

  useEffect(() => {
    if (gameOver || isPaused || !currentPiece) return;

    const speed = Math.max(100, 1000 - (level - 1) * 100);
    gameIntervalRef.current = setInterval(() => {
      movePiece('down');
    }, speed);

    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [currentPiece, gameOver, isPaused, level, movePiece]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver || isPaused) {
        if (e.key === ' ') {
          e.preventDefault();
          setIsPaused(false);
          setGameOver(false);
          setBoard(createEmptyBoard());
          setScore(0);
          setLines(0);
          setLevel(1);
          const newPiece = getRandomPiece();
          setCurrentPiece(newPiece);
          setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece('right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece('down');
          break;
        case 'ArrowUp':
        case 'x':
        case 'X':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(!isPaused);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, isPaused, movePiece, rotate]);

  function renderBoard() {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece && !gameOver) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const newX = currentPosition.x + x;
            const newY = currentPosition.y + y;
            if (newY >= 0 && newY < BOARD_HEIGHT && newX >= 0 && newX < BOARD_WIDTH) {
              displayBoard[newY][newX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard;
  }

  return (
    <div className="tetris-container">
      <div className="tetris-game">
        <div className="tetris-header">
          <h2>테트리스</h2>
          <button className="close-button" onClick={onClose}>
            채팅으로 돌아가기
          </button>
        </div>

        <div className="tetris-main">
          <div className="tetris-info">
            <div className="info-box">
              <h3>점수</h3>
              <p>{score}</p>
            </div>
            <div className="info-box">
              <h3>레벨</h3>
              <p>{level}</p>
            </div>
            <div className="info-box">
              <h3>줄</h3>
              <p>{lines}</p>
            </div>
          </div>

          <div className="tetris-board-container">
            <div className="tetris-board">
              {renderBoard().map((row, y) => (
                <div key={y} className="tetris-row">
                  {row.map((cell, x) => (
                    <div
                      key={`${y}-${x}`}
                      className="tetris-cell"
                      style={{ backgroundColor: cell || '#1a1a2e' }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {(gameOver || isPaused) && (
              <div className="game-overlay">
                <div className="overlay-content">
                  {gameOver ? (
                    <>
                      <h2>게임 오버!</h2>
                      <p>최종 점수: {score}</p>
                      <p>스페이스바를 눌러 다시 시작</p>
                    </>
                  ) : (
                    <>
                      <h2>일시 정지</h2>
                      <p>스페이스바를 눌러 계속</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="tetris-controls">
          <div className="controls-info">
            <h3>조작법</h3>
            <p>← → : 이동</p>
            <p>↓ : 빠르게 내리기</p>
            <p>↑ / X : 회전</p>
            <p>스페이스바 : 일시정지</p>
          </div>
          <button className="pause-button" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? '재개' : '일시정지'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tetris;

