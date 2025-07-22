import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Color Palette for the UI
 */
const COLORS = {
  primary: '#1976d2',
  secondary: '#424242',
  accent: '#ffca28',
};

/**
 * PUBLIC_INTERFACE
 * Returns the winner symbol ('X' or 'O'), or null if no winner.
 */
function calculateWinner(squares) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b,c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

/**
 * Checks if every square is filled (draw).
 */
function isBoardFull(squares) {
  return squares.every((sq) => sq !== null);
}

/**
 * PUBLIC_INTERFACE
 * Basic random-move AI for Tic Tac Toe.
 * Returns the index for the AI to play, or null if no possible move.
 * Can be improved to minimax later; here, just chooses random empty square.
 */
function getRandomAIMove(squares) {
  const emptyIndices = squares
    .map((val, idx) => (val === null ? idx : null))
    .filter((v) => v !== null);
  if (emptyIndices.length === 0) return null;
  const chosen = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  return chosen;
}

/**
 * App component. Handles board, UI controls, game logic, and now, AI mode logic.
 */
function App() {
  // --- Game state ---
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState('human'); // "human" or "ai"
  const [aiMark, setAIMark] = useState('O'); // "O" or "X" (AI plays as)
  const [gameStarted, setGameStarted] = useState(false);
  const [status, setStatus] = useState('');
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);

  // --- UI status update ---
  useEffect(() => {
    const win = calculateWinner(squares);
    if (win) {
      setWinner(win);
      if (mode === "ai") {
        setStatus(win === aiMark 
          ? "AI wins!"
          : win !== aiMark 
            ? "You win!" 
            : `Player ${win} wins!`);
      } else {
        setStatus(`Player ${win} wins!`);
      }
      setDraw(false);
    } else if (isBoardFull(squares)) {
      setWinner(null);
      setDraw(true);
      setStatus("It's a draw!");
    } else {
      setWinner(null);
      setDraw(false);
      if (mode === 'ai') {
        const aiTurn = ((aiMark === 'X' && isXNext) || (aiMark === 'O' && !isXNext));
        setStatus(
          aiTurn
            ? "AI is thinking..."
            : `Your turn (${isXNext ? (aiMark === "O" ? "X" : "O") : (aiMark === "O" ? "O" : "X")})`
        );
      } else {
        setStatus(`Next player: ${isXNext ? 'X' : 'O'}`);
      }
    }
  }, [squares, isXNext, mode, aiMark]);

  /**
   * AI move effect - triggers "AI" move after human in AI mode.
   */
  useEffect(() => {
    if (!gameStarted) return;
    if (winner || draw || mode !== 'ai') return;

    // Is it AI's turn?
    const aiGoesNow = (aiMark === 'X' && isXNext) || (aiMark === 'O' && !isXNext);

    if (aiGoesNow) {
      const timeout = setTimeout(() => {
        // Find AI move (basic random move; can improve this logic later easily)
        const aiMove = getRandomAIMove(squares);
        if (aiMove != null && squares[aiMove] === null) {
          const nsq = squares.slice();
          nsq[aiMove] = aiMark; // AI always uses aiMark
          setSquares(nsq);
          setIsXNext((x) => !x);
        }
      }, 450);
      return () => clearTimeout(timeout);
    }
  }, [squares, isXNext, mode, aiMark, winner, draw, gameStarted]);

  // PUBLIC_INTERFACE
  function handleClick(idx) {
    if (!gameStarted) return;
    if (winner || draw || squares[idx]) return;

    if (mode === 'ai') {
      // The AI mark and human mark are opposite
      const humanMark = aiMark === 'O' ? 'X' : 'O';
      const humanTurn = ((humanMark === 'X' && isXNext) || (humanMark === 'O' && !isXNext));
      if (!humanTurn) return; // Don't let player move if it's not player's turn

      // Make move
      const nsq = squares.slice();
      nsq[idx] = humanMark;
      setSquares(nsq);
      setIsXNext((x) => !x);
    } else {
      // Local two-player mode
      const nsq = squares.slice();
      nsq[idx] = isXNext ? 'X' : 'O';
      setSquares(nsq);
      setIsXNext((x) => !x);
    }
  }

  // PUBLIC_INTERFACE
  function handleStart() {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setDraw(false);
    setGameStarted(true);
  }

  // PUBLIC_INTERFACE
  function handleBackToMenu() {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setDraw(false);
    setGameStarted(false);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setDraw(false);
    // Only reset game, do not leave the in-game UI
    // If game is just finished: go back to menu instead of new game
    if (winner || draw) setGameStarted(false);
  }

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    const nextMode = e.target.value;
    setMode(nextMode);
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setDraw(false);
    if (nextMode === 'ai' && aiMark !== 'O') setAIMark('O'); // Default: AI starts as O
  }

  // PUBLIC_INTERFACE
  function handleAIMarkChange(e) {
    setAIMark(e.target.value);
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setDraw(false);
  }

  // --- UI Components ---

  // Animated underline decorative
  function AnimatedUnderline() {
    return (
      <div
        style={{
          margin: "0.25em auto 0",
          width: 64,
          height: 4.5,
          background: "linear-gradient(90deg,#1976d2 55%, #ffca28 80%, #fff0 100%)",
          borderRadius: 3,
        }}
      />
    );
  }

  // Single board square
  function renderSquare(idx) {
    const cls =
      squares[idx] === 'X'
        ? 'ttt-square x'
        : squares[idx] === 'O'
        ? 'ttt-square o'
        : 'ttt-square';

    return (
      <button
        className={cls}
        onClick={() => handleClick(idx)}
        disabled={!!squares[idx] ||
          winner ||
          draw ||
          (mode === 'ai' && ((aiMark === 'X' && isXNext) || (aiMark === 'O' && !isXNext)))
        }
        style={{
          color:
            squares[idx] === 'X'
              ? COLORS.primary
              : squares[idx] === 'O'
              ? COLORS.accent
              : COLORS.secondary,
          borderColor: squares[idx]
            ? (squares[idx] === 'X' ? COLORS.primary : COLORS.accent)
            : COLORS.primary,
          background: '#fff',
          position: 'relative',
          outline: 'none',
        }}
        aria-label={squares[idx] ? squares[idx] : `Empty Square ${idx + 1}`}
        key={idx}
      >
        {squares[idx]}
        <span className="ttt-square-effect" />
      </button>
    );
  }

  // Main Menu
  if (!gameStarted) {
    return (
      <div
        className="App"
        style={{
          minHeight: '100vh',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <header
          style={{
            width: '100%',
            margin: '52px 0 10px',
            textAlign: 'center',
            padding: 0,
          }}
        >
          <h1
            style={{
              fontWeight: 700,
              letterSpacing: '2.1px',
              color: COLORS.primary,
              fontSize: '2.25rem',
              marginBottom: 0,
              lineHeight: 1.11,
            }}
          >
            Tic Tac Toe
          </h1>
          <AnimatedUnderline />
          <p
            style={{
              color: COLORS.secondary,
              fontSize: '1.14rem',
              margin: 0,
              marginTop: 8,
              fontWeight: 400,
              letterSpacing: '.01em',
            }}
          >
            Classic game · Minimal React UI
          </p>
        </header>
        <section
          style={{
            width: '100vw',
            maxWidth: 'min(410px,96vw)',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '0.95em',
              marginBottom: '2em',
              justifyContent: 'center',
            }}
          >
            <label
              style={{
                fontSize: 15,
                fontWeight: 500,
                opacity: 0.82,
                letterSpacing: ".03em",
                display: "flex",
                alignItems: "center",
              }}
            >
              Mode:
              <select
                value={mode}
                onChange={handleModeChange}
                style={{
                  marginLeft: 5,
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  borderRadius: 7,
                  border: `1.2px solid ${COLORS.secondary}`,
                  padding: "5px 13px",
                  fontSize: 15,
                  color: COLORS.primary,
                  background: "#f9f9f9"
                }}
                aria-label="Select Game Mode"
              >
                <option value="human">2 Players</option>
                <option value="ai">Play vs AI</option>
              </select>
            </label>
            {mode === 'ai' && (
              <label
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  opacity: 0.82,
                  marginLeft: 3,
                  letterSpacing: ".02em",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                AI as&nbsp;
                <select
                  value={aiMark}
                  onChange={handleAIMarkChange}
                  style={{
                    marginLeft: 1,
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    borderRadius: 7,
                    border: `1.2px solid ${COLORS.secondary}`,
                    padding: "5px 10px",
                    fontSize: 15,
                    color: COLORS.accent,
                    background: "#f9f9f9"
                  }}
                  aria-label="Select AI Marker"
                >
                  <option value="O">O</option>
                  <option value="X">X</option>
                </select>
              </label>
            )}
          </div>
          <button
            className="start-game-btn"
            onClick={handleStart}
            tabIndex={0}
          >
            <span
              style={{
                fontWeight: 700,
                letterSpacing: ".06em",
                textShadow: "0 2.5px 14px rgba(25,118,210,0.07)",
              }}
            >
              Start Game
            </span>
          </button>
        </section>
        <footer
          style={{
            fontSize: '13.5px',
            color: COLORS.secondary,
            marginTop: '4em',
            padding: '10px 0',
            letterSpacing: '.042rem',
            opacity: 0.85,
          }}
        >
          &copy; {new Date().getFullYear()} Minimal Tic Tac Toe
        </footer>
      </div>
    );
  }

  // In-game UI
  return (
    <div
      className="App"
      style={{
        minHeight: '100vh',
        background: '#fff',
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <header
        style={{
          width: '100%',
          margin: '52px 0 16px',
          textAlign: 'center',
          padding: 0
        }}
      >
        <h1
          style={{
            fontWeight: 700,
            letterSpacing: '2.1px',
            color: COLORS.primary,
            fontSize: '2.25rem',
            marginBottom: 0,
            lineHeight: 1.12
          }}
        >
          Tic Tac Toe
        </h1>
        <AnimatedUnderline />
        <p
          style={{
            color: COLORS.secondary,
            fontSize: '1.13rem',
            margin: 0,
            marginTop: 8,
            fontWeight: 400
          }}
        >
          Classic game · {mode === 'human' ? '2 Players' : 'Play vs AI'}
        </p>
      </header>
      <section
        style={{
          width: '100vw',
          maxWidth: 'min(410px,96vw)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Control Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '1em',
            marginBottom: 21,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <label
            style={{
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: ".025em"
            }}
          >
            Mode:
            <select
              value={mode}
              onChange={handleModeChange}
              style={{
                marginLeft: 4,
                fontFamily: 'inherit',
                fontWeight: 600,
                borderRadius: 7,
                border: `1.2px solid ${COLORS.secondary}`,
                padding: "4px 11px",
                fontSize: 15,
                color: COLORS.primary,
                background: "#f9f9f9",
              }}
              aria-label="Change Game Mode"
            >
              <option value="human">2 Players</option>
              <option value="ai">Play vs AI</option>
            </select>
          </label>
          {mode === 'ai' && (
            <label
              style={{
                fontSize: 15,
                fontWeight: 500,
                marginLeft: 3,
                letterSpacing: ".02em"
              }}
            >
              AI as&nbsp;
              <select
                value={aiMark}
                onChange={handleAIMarkChange}
                style={{
                  marginLeft: 1,
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  borderRadius: 7,
                  border: `1.2px solid ${COLORS.secondary}`,
                  padding: "4px 9px",
                  fontSize: 15,
                  color: COLORS.accent,
                  background: "#f9f9f9"
                }}
                aria-label="Change AI Marker"
              >
                <option value="O">O</option>
                <option value="X">X</option>
              </select>
            </label>
          )}
          <button
            className="start-game-btn"
            onClick={winner || draw ? handleBackToMenu : handleReset}
            style={{
              marginLeft: 12,
              padding: "7px 20px",
              fontSize: 15.2,
              background: winner
                ? COLORS.accent
                : draw
                ? COLORS.secondary
                : COLORS.primary,
              color: "#fff",
              borderRadius: 9,
              border: "none",
              boxShadow: "0px 3px 16px 0px rgba(25, 118, 210, 0.03)",
              opacity: winner || draw ? 0.96 : 1.0,
              fontWeight: 600,
              letterSpacing: ".04em"
            }}
          >
            {winner || draw ? "Back to Menu" : "Reset"}
          </button>
        </div>
        {/* Game Board */}
        <div
          className="ttt-board"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            width: 'min(330px,95vw)',
            aspectRatio: '1',
            background: '#fff',
            border: `2.4px solid ${COLORS.primary}`,
            borderRadius: '17px',
            boxShadow: '0 3.5px 22px rgba(25, 118, 210, 0.13)',
          }}
        >
          {Array(9)
            .fill(0)
            .map((_, i) => renderSquare(i))}
        </div>
        {/* Game status */}
        <div
          className="game-status"
          style={{
            textAlign: 'center',
            margin: '28px 0 0',
            fontWeight: 650,
            color: winner
              ? COLORS.accent
              : draw
              ? COLORS.secondary
              : COLORS.primary,
            fontSize: '1.2rem',
            minHeight: '2em',
            letterSpacing: ".015em"
          }}
        >
          {status}
        </div>
      </section>
      <footer
        style={{
          fontSize: '13.5px',
          color: COLORS.secondary,
          marginTop: '4em',
          padding: '10px 0',
          letterSpacing: '.042rem',
          opacity: 0.88
        }}
      >
        &copy; {new Date().getFullYear()} Minimal Tic Tac Toe
      </footer>
    </div>
  );
}

export default App;
