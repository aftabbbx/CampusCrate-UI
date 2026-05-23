import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadMessages, setUnreadMessages] = useState({}); // { userId: count }
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [lastIncomingMessage, setLastIncomingMessage] = useState(null);

  // Connect socket when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3400';
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // ─── Connection Events ──────────────────────────────────────
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // ─── Online Users ───────────────────────────────────────────
    socket.on('online-users-list', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on('user-online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on('user-offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // ─── Incoming Message ───────────────────────────────────────
    socket.on('receive-message', (msg) => {
      setLastIncomingMessage(msg);
      // Increment unread count for this sender
      setUnreadMessages((prev) => ({
        ...prev,
        [msg.sender_id]: (prev[msg.sender_id] || 0) + 1,
      }));

      // Show toast notification (WhatsApp style)
      const preview = msg.message_type === 'image' ? '📷 Photo'
        : msg.message_type === 'voice' ? '🎙️ Voice note'
        : msg.message?.substring(0, 50) || 'New message';
      toast(`💬 ${preview}`, {
        duration: 3000,
        style: {
          background: '#1e1b4b',
          color: '#fff',
          fontWeight: 500,
          fontSize: '0.85rem',
          borderRadius: '12px',
        },
      });
    });

    // ─── Notification Events ────────────────────────────────────
    socket.on('new-notification', () => {
      setUnreadNotifications((prev) => prev + 1);
    });

    // ─── Typing ─────────────────────────────────────────────────
    socket.on('user-typing', ({ userId }) => {
      setTypingUsers((prev) => new Set([...prev, userId]));
    });

    socket.on('user-stop-typing', ({ userId }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // ─── Messages Read ──────────────────────────────────────────
    socket.on('messages-marked-read', ({ reader_id }) => {
      // Clear unread for this reader (they read our messages)
      // This is useful if we want to show double tick
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token]);

  // ─── Emit helpers ───────────────────────────────────────────────
  const emitTyping = useCallback((receiverId) => {
    socketRef.current?.emit('typing', { receiver_id: receiverId });
  }, []);

  const emitStopTyping = useCallback((receiverId) => {
    socketRef.current?.emit('stop-typing', { receiver_id: receiverId });
  }, []);

  const emitMessagesRead = useCallback((senderId) => {
    socketRef.current?.emit('messages-read', { sender_id: senderId });
  }, []);

  const markConversationRead = useCallback((userId) => {
    setUnreadMessages((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  const clearNotificationCount = useCallback(() => {
    setUnreadNotifications(0);
  }, []);

  // Total unread messages across all conversations
  const totalUnreadMessages = Object.values(unreadMessages).reduce((a, b) => a + b, 0);

  const value = {
    socket: socketRef.current,
    onlineUsers,
    unreadMessages,
    totalUnreadMessages,
    unreadNotifications,
    typingUsers,
    lastIncomingMessage,
    emitTyping,
    emitStopTyping,
    emitMessagesRead,
    markConversationRead,
    clearNotificationCount,
    setUnreadNotifications,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
