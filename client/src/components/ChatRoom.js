import React, { useState, useEffect, useRef } from 'react';
import './ChatRoom.css';

const ChatRoom = ({ socket, onPlayTetris }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.on('message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('userJoined', (data) => {
      setMessages((prev) => [...prev, { ...data, type: 'system' }]);
    });

    socket.on('userLeft', (data) => {
      setMessages((prev) => [...prev, { ...data, type: 'system' }]);
    });

    socket.on('userList', (userList) => {
      setUsers(userList);
    });

    socket.on('typing', (data) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.username);
        } else {
          newSet.delete(data.username);
        }
        return newSet;
      });
    });

    return () => {
      socket.off('message');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('userList');
      socket.off('typing');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      socket.emit('message', { message: messageInput.trim() });
      setMessageInput('');
      socket.emit('typing', { isTyping: false });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    socket.emit('typing', { isTyping: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { isTyping: false });
    }, 1000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h2>채팅방</h2>
        <button className="tetris-button" onClick={onPlayTetris}>
          🎮 테트리스 플레이
        </button>
      </div>

      <div className="chat-container">
        <div className="chat-sidebar">
          <h3>온라인 사용자 ({users.length})</h3>
          <ul className="user-list">
            {users.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
        </div>

        <div className="chat-main">
          <div className="messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.type === 'system' ? 'system-message' : ''}`}
              >
                {msg.type !== 'system' && (
                  <div className="message-header">
                    <span className="message-username">{msg.username}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                )}
                <div className="message-content">{msg.message}</div>
              </div>
            ))}
            {typingUsers.size > 0 && (
              <div className="typing-indicator">
                {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="message-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={messageInput}
              onChange={handleTyping}
              placeholder="메시지를 입력하세요..."
              className="message-input"
            />
            <button type="submit" className="send-button">
              전송
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;

