import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Color Palette (per requirements)
 *  Primary: #1976d2
 *  Secondary: #424242
 *  Accent: #ffca28
 */
const COLORS = {
  primary: '#1976d2',
  secondary: '#424242',
  accent: '#ffca28',
};

// Game status detection
function calculateWinner(squares) {
  // Returns 'X' or 'O' if there's a win, null otherwise.
  const lines = [
    [0,1,2], [3,4,5], [6,7,8], // Rows
    [0,3,6], [1,4,7], [2,5,8], // Cols
    [0,4,8], [2,4,6],          // Diags
  ];
  for (let [a,b,c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

function isBoardFull(squares) {
  return squares.every(sq => sq !== null);
}

// Basic AI logic: win if possible, block opponent, or pick first empty.
function getAIMove(squares, aiMark, humanMark) {
  // Try to win
  for (let i = 0; i < 9; ++i) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = aiMark;
      if (calculateWinner(copy) === aiMark) return i;
    }
  }
  // Block opponent
  for (let i = 0; i < 9; ++i) {
    if (!squares[i]) {
      const copy = squares.slice();
      copy[i] = humanMark;
      if (calculateWinner(copy) === humanMark) return i;
    }
  }
  // Pick center
  if (!squares[4]) return 4;
  // Pick first empty
  for (let i = 0; i < 9; ++i) {
    if (!squares[i]) return i;
  }
  // Shouldn't reach here
  return null;
}

/**
 * Main App component for Tic Tac Toe.
 * Adds a Start Game feature: board and controls only display once started.
 */
/*
 * PUBLIC_INTERFACE
 * Enhanced UI version: Modern minimalistic, light style, beautiful spacing and effects
 */
function App() {
  // Game state hooks
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState('human');
  const [aiPlays, setAIPlays] = useState('O');
  const [status, setStatus] = useState('');
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Handle game result and UI status updates
  useEffect(() => {
    const win = calculateWinner(squares);
    if (win) {
      setWinner(win);
      setStatus(
        win === 'X'
          ? 'Player X wins!'
          : mode === 'ai' && win === aiPlays
          ? 'AI wins!'
          : `Player ${win} wins!`
      );
      setDraw(false);
    } else if (isBoardFull(squares)) {
      setWinner(null);
      setStatus("It's a draw!");
      setDraw(true);
    } else {
      setWinner(null);
      setDraw(false);
      if (mode === 'ai') {
        if (
          (aiPlays === 'X' && isXNext) ||
          (aiPlays === 'O' && !isXNext)
        ) {
          setStatus('AI is thinking...');
        } else {
          setStatus(`Your turn (${isXNext ? 'X' : 'O'})`);
        }
      } else {
        setStatus(`Next player: ${isXNext ? 'X' : 'O'}`);
      }
    }
  }, [squares, isXNext, mode, aiPlays]);

  // AI move side-effect
  useEffect(() => {
    if (winner || draw || mode !== 'ai') return;
    const aiTurn =
      (aiPlays === 'X' && isXNext) || (aiPlays === 'O' && !isXNext);
    if (aiTurn) {
      const timer = setTimeout(() => {
        const move = getAIMove(
          squares,
          aiPlays,
          aiPlays === 'X' ? 'O' : 'X'
        );
        if (move != null) {
          const nextSquares = squares.slice();
          nextSquares[move] = aiPlays;
          setSquares(nextSquares);
          setIsXNext((x) => !x);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [squares, isXNext, mode, aiPlays, winner, draw]);

  // PUBLIC_INTERFACE
  function handleClick(idx) {
    if (winner || draw) return;
    if (mode === 'ai') {
      const humanMark = aiPlays === 'X' ? 'O' : 'X';
      const isHumanTurn =
        (humanMark === 'X' && isXNext) ||
        (humanMark === 'O' && !isXNext);
      if (!isHumanTurn || squares[idx]) return;
      const nextSquares = squares.slice();
      nextSquares[idx] = humanMark;
      setSquares(nextSquares);
      setIsXNext((x) => !x);
    } else {
      if (squares[idx]) return;
      const nextSquares = squares.slice();
      nextSquares[idx] = isXNext ? 'X' : 'O';
      setSquares(nextSquares);
      setIsXNext((x) => !x);
    }
  }

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    const v = e.target.value;
    setMode(v);
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setDraw(false);
    // AI always plays 'O' by default
    if (v === 'ai') setAIPlays('O');
  }

  // PUBLIC_INTERFACE
  function handleAIPlaysChange(e) {
    setAIPlays(e.target.value);
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setDraw(false);
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
  function handleReset() {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setDraw(false);
    if (winner || draw) setGameStarted(false);
  }

  // Component: Animated underline for header
  function AnimatedUnderline() {
    return (
      <div
        style={{
          margin: "0.25em auto 0",
          width: 64,
          height: 4.5,
          background:
            "linear-gradient(90deg,#1976d2 55%, #ffca28 80%, #fff0 100%)",
          borderRadius: 3,
        }}
      />
    );
  }

  // Minimalistic Board rendering, with ripple animation on click
  function renderSquare(idx) {
    // Assign .x or .o class for 3D effect when filled, else default.
    const filledClass =
      squares[idx] === 'X'
        ? 'ttt-square x'
        : squares[idx] === 'O'
        ? 'ttt-square o'
        : 'ttt-square';

    return (
      <button
        className={filledClass}
        onClick={() => handleClick(idx)}
        disabled={
          !!squares[idx] ||
          winner ||
          draw ||
          (mode === 'ai' && aiPlays === (isXNext ? 'X' : 'O'))
        }
        style={{
          color:
            squares[idx] === 'X'
              ? COLORS.primary
              : squares[idx] === 'O'
              ? COLORS.accent
              : COLORS.secondary,
          borderColor: squares[idx]
            ? (squares[idx] === 'X'
                ? COLORS.primary
                : COLORS.accent)
            : COLORS.primary,
          background: '#fff',
          position: "relative",
          outline: "none"
        }}
        aria-label={squares[idx] ? squares[idx] : `Empty Square ${idx + 1}`}
        key={idx}
      >
        {squares[idx]}
        {/* Ripple/hover highlight (pure CSS) */}
        {/* This empty div is for extra effect via .ttt-square:focus-visible in CSS. */}
        <span className="ttt-square-effect" />
      </button>
    );
  }

  // Main Menu UI
  if (!gameStarted) {
    return (
      <div
        className="App"
        style={{
          minHeight: '100vh',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <header
          style={{
            width: '100%',
            margin: '52px 0 10px',
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
              lineHeight: 1.11
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
              letterSpacing: '.01em'
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
            justifyContent: 'center'
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
            <label style={{
              fontSize: 15,
              fontWeight: 500,
              opacity: 0.82,
              letterSpacing: ".03em",
              display: "flex",
              alignItems: "center"
            }}>
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
              >
                <option value="human">2 Players</option>
                <option value="ai">Play vs AI</option>
              </select>
            </label>
            {mode === 'ai' && (
              <label style={{
                fontSize: 15,
                fontWeight: 500,
                opacity: 0.82,
                marginLeft: 3,
                letterSpacing: ".02em",
                display: "flex",
                alignItems: "center"
              }}>
                AI as&nbsp;
                <select
                  value={aiPlays}
                  onChange={handleAIPlaysChange}
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
            <span style={{
              fontWeight: 700,
              letterSpacing: ".06em",
              textShadow: `0 2.5px 14px rgba(25,118,210,0.07)`,
            }}>
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
            opacity: 0.85
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
          Classic game · {mode === "human" ? "2 Players" : "Play vs AI"}
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
          <label style={{
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: ".025em"
          }}>
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
            >
              <option value="human">2 Players</option>
              <option value="ai">Play vs AI</option>
            </select>
          </label>
          {mode === 'ai' && (
            <label style={{
              fontSize: 15,
              fontWeight: 500,
              marginLeft: 3,
              letterSpacing: ".02em"
            }}>
              AI as&nbsp;
              <select
                value={aiPlays}
                onChange={handleAIPlaysChange}
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
              >
                <option value="O">O</option>
                <option value="X">X</option>
              </select>
            </label>
          )}
          <button
            className="start-game-btn"
            onClick={handleReset}
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
              boxShadow:
                "0px 3px 16px 0px rgba(25, 118, 210, 0.03)",
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
