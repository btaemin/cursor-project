import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import ChatRoom from './components/ChatRoom';
import Tetris from './components/Tetris';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showTetris, setShowTetris] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('join', username.trim());
      setIsLoggedIn(true);
    }
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <div className="login-container">
          <div className="login-box">
            <h1>채팅방 입장</h1>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="사용자 이름을 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              <button type="submit">입장하기</button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {showTetris ? (
            <Tetris onClose={() => setShowTetris(false)} />
          ) : (
            <ChatRoom socket={socket} onPlayTetris={() => setShowTetris(true)} />
          )}
        </>
      )}
    </div>
  );
}

export default App;

