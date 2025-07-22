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

// PUBLIC_INTERFACE
function App() {
  // 'X' always starts
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState('human'); // 'human' or 'ai'
  const [aiPlays, setAIPlays] = useState('O'); // Which symbol does AI play as ('X' or 'O')
  const [status, setStatus] = useState('');
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);

  // Handle game result
  useEffect(() => {
    const win = calculateWinner(squares);
    if (win) {
      setWinner(win);
      setStatus(win === 'X' ? 'Player X wins!' : mode === 'ai' && win === aiPlays ? 'AI wins!' : `Player ${win} wins!`);
      setDraw(false);
    } else if (isBoardFull(squares)) {
      setWinner(null);
      setStatus("It's a draw!");
      setDraw(true);
    } else {
      setWinner(null);
      setDraw(false);
      if (mode === 'ai') {
        if ((aiPlays === 'X' && isXNext) || (aiPlays === 'O' && !isXNext)) {
          setStatus('AI is thinking...');
        } else {
          setStatus(`Your turn (${isXNext ? 'X' : 'O'})`);
        }
      } else {
        setStatus(`Next player: ${isXNext ? 'X' : 'O'}`);
      }
    }
  }, [squares, isXNext, mode, aiPlays]);

  // AI move
  useEffect(() => {
    if (winner || draw || mode !== 'ai') return;
    const aiTurn = (aiPlays === 'X' && isXNext) || (aiPlays === 'O' && !isXNext);
    if (aiTurn) {
      // Add delay for realism
      const timer = setTimeout(() => {
        const move = getAIMove(squares, aiPlays, aiPlays === 'X' ? 'O' : 'X');
        if (move != null) {
          const nextSquares = squares.slice();
          nextSquares[move] = aiPlays;
          setSquares(nextSquares);
          setIsXNext(x => !x);
        }
      }, 400); // 400ms AI "thinking"
      return () => clearTimeout(timer);
    }
  }, [squares, isXNext, mode, aiPlays, winner, draw]);

  // PUBLIC_INTERFACE
  function handleClick(idx) {
    if (winner || draw) return;
    if (mode === 'ai') {
      const humanMark = aiPlays === 'X' ? 'O' : 'X';
      const isHumanTurn = (humanMark === 'X' && isXNext) || (humanMark === 'O' && !isXNext);
      if (!isHumanTurn || squares[idx]) return;
      const nextSquares = squares.slice();
      nextSquares[idx] = humanMark;
      setSquares(nextSquares);
      setIsXNext(x => !x);
    } else {
      if (squares[idx]) return;
      const nextSquares = squares.slice();
      nextSquares[idx] = isXNext ? 'X' : 'O';
      setSquares(nextSquares);
      setIsXNext(x => !x);
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
    // AI always plays as 'O' by default
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
  function handleReset() {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setDraw(false);
  }

  // Minimalistic Board:
  function renderSquare(idx) {
    return (
      <button
        className="ttt-square"
        onClick={() => handleClick(idx)}
        disabled={!!squares[idx] || winner || draw ||
          (mode === 'ai' && aiPlays === (isXNext ? 'X' : 'O'))}
        style={{
          color: squares[idx] === 'X'
            ? COLORS.primary
            : squares[idx] === 'O'
              ? COLORS.accent
              : COLORS.secondary,
          borderColor: COLORS.primary,
          background: '#fff',
        }}
        aria-label={squares[idx] ? squares[idx] : `Empty Square ${idx+1}`}
        key={idx}
      >{squares[idx]}</button>
    );
  }

  return (
    <div className="App" style={{ minHeight: '100vh', background: '#fff' }}>
      <header style={{margin: '40px 0 10px', textAlign: 'center'}}>
        <h1
          style={{
            fontWeight: '700',
            letterSpacing: '2px',
            color: COLORS.primary,
            fontSize: '2.1rem',
            marginBottom: '0.25em',
          }}
        >
          Tic Tac Toe
        </h1>
        <p style={{color: COLORS.secondary, fontSize: '1.15rem', margin: 0}}>
          Classic game – two players or play against AI.
        </p>
      </header>
      <section style={{
        width: '100vw',
        maxWidth: 'min(400px,90vw)',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Controls */}
        <div style={{
          display: 'flex', flexDirection: 'row', gap: '1em',
          marginBottom: '1.5em', justifyContent: 'center'
        }}>
          <label style={{fontSize:14, fontWeight: 500}}>Mode:
            <select value={mode} onChange={handleModeChange}
              style={{
                marginLeft: 6,
                fontFamily: 'inherit',
                fontWeight: 600,
                borderRadius: 6,
                border: `1px solid ${COLORS.secondary}`,
                padding: '3px 10px'
              }}>
              <option value="human">2 Players</option>
              <option value="ai">Play vs AI</option>
            </select>
          </label>
          {mode === 'ai' &&
            <label style={{fontSize:14, fontWeight: 500}}>
              AI plays as:
              <select value={aiPlays} onChange={handleAIPlaysChange}
                style={{
                  marginLeft: 6,
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  borderRadius: 6,
                  border: `1px solid ${COLORS.secondary}`,
                  padding: '3px 7px'
                }}>
                <option value="O">O</option>
                <option value="X">X</option>
              </select>
            </label>
          }
          <button
            onClick={handleReset}
            style={{
              marginLeft: 16,
              border: 'none',
              borderRadius: 6,
              background: COLORS.primary,
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 15,
              padding: '4px 15px',
              transition: 'filter 0.23s',
              boxShadow: '0px 2px 8px 1px rgba(25, 118, 210, 0.08)',
            }}
          >
            Reset
          </button>
        </div>

        {/* Board */}
        <div
          className="ttt-board"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            width: 'min(320px, 90vw)',
            aspectRatio: '1',
            background: '#fff',
            border: `2.4px solid ${COLORS.primary}`,
            borderRadius: '17px',
            boxShadow: '0 3px 18px rgba(25, 118, 210, 0.07)',
          }}>
          {Array(9).fill(0).map((_, i) => renderSquare(i))}
        </div>

        {/* Status */}
        <div className="game-status" style={{
          textAlign: 'center',
          margin: '28px 0 0',
          fontWeight: 600,
          color: winner
            ? COLORS.accent
            : draw
            ? COLORS.secondary
            : COLORS.primary,
          fontSize: '1.16rem',
          minHeight: '2em',
        }}>
          {status}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        fontSize: '13px',
        color: COLORS.secondary,
        marginTop: '4em',
        padding: '10px 0',
        letterSpacing: '0.04rem'
      }}>
        &copy; {new Date().getFullYear()} Minimalistic React Tic Tac Toe
      </footer>
    </div>
  );
}

export default App;
