import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import API from '../api/axios';

const SocketContext = createContext(null);

const LS_MSG_KEY  = 'cc_unread_messages';
const LS_NOTIF_KEY = 'cc_unread_notifications';

const loadFromLS = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers]         = useState(new Set());
  const [typingUsers, setTypingUsers]         = useState(new Set());
  const [lastIncomingMessage, setLastIncomingMessage] = useState(null);

  // ── Persisted counts (survive refresh) ─────────────────────────────
  const [unreadMessages, setUnreadMessagesState] = useState(() => loadFromLS(LS_MSG_KEY, {}));
  const [unreadNotifications, setUnreadNotifState] = useState(() => loadFromLS(LS_NOTIF_KEY, 0));

  const setUnreadMessages = useCallback((updater) => {
    setUnreadMessagesState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(LS_MSG_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setUnreadNotifications = useCallback((updater) => {
    setUnreadNotifState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(LS_NOTIF_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── On login: fetch real counts from backend (once per session) ─────
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Clear counts on logout
      localStorage.removeItem(LS_MSG_KEY);
      localStorage.removeItem(LS_NOTIF_KEY);
      setUnreadMessagesState({});
      setUnreadNotifState(0);
      hasFetchedRef.current = false;
      return;
    }

    if (hasFetchedRef.current) return; // Already fetched this session
    hasFetchedRef.current = true;

    const fetchInitialCounts = async () => {
      try {
        // Fetch all notifications but only count non-message types for bell badge
        const notifRes = await API.get('/notification/all');
        if (notifRes.data.success) {
          const nonMsgUnread = (notifRes.data.notifications || [])
            .filter(n => !n.is_read && n.type !== 'message').length;
          setUnreadNotifState(nonMsgUnread);
          localStorage.setItem(LS_NOTIF_KEY, JSON.stringify(nonMsgUnread));
        }
      } catch (_) {}

      try {
        const convRes = await API.get('/message/conversations');
        if (convRes.data.success) {
          const map = {};
          (convRes.data.conversations || []).forEach((c) => {
            if (c.unreadCount > 0) map[c.user._id] = c.unreadCount;
          });
          setUnreadMessagesState(map);
          localStorage.setItem(LS_MSG_KEY, JSON.stringify(map));
        }
      } catch (_) {}
    };

    fetchInitialCounts();
  }, [isAuthenticated, token]);

  // ── Socket connection ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3400';
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('connect_error', (err) => console.error('Socket error:', err.message));

    // ── Online Users ───────────────────────────────────────────────
    socket.on('online-users-list', (userIds) => setOnlineUsers(new Set(userIds)));
    socket.on('user-online',  ({ userId }) => setOnlineUsers((p) => new Set([...p, userId])));
    socket.on('user-offline', ({ userId }) => setOnlineUsers((p) => { const n = new Set(p); n.delete(userId); return n; }));

    // ── Incoming Message ───────────────────────────────────────────
    socket.on('receive-message', (msg) => {
      setLastIncomingMessage(msg);
      setUnreadMessages((prev) => ({
        ...prev,
        [msg.sender_id]: (prev[msg.sender_id] || 0) + 1,
      }));
    });

    // ── Notifications ──────────────────────────────────────────────
    // Skip if it came right after a message (backend fires both for messages)
    socket.on('new-notification', (data) => {
      // If type is 'message' or event arrived within 300ms of a message → skip
      if (data?.type === 'message') return;
      setUnreadNotifications((prev) => prev + 1);
    });

    // ── Typing ────────────────────────────────────────────────────
    socket.on('user-typing',      ({ userId }) => setTypingUsers((p) => new Set([...p, userId])));
    socket.on('user-stop-typing', ({ userId }) => setTypingUsers((p) => { const n = new Set(p); n.delete(userId); return n; }));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token]);

  // ── Helpers ────────────────────────────────────────────────────────
  const emitTyping        = useCallback((id) => socketRef.current?.emit('typing',       { receiver_id: id }), []);
  const emitStopTyping    = useCallback((id) => socketRef.current?.emit('stop-typing',  { receiver_id: id }), []);
  const emitMessagesRead  = useCallback((id) => socketRef.current?.emit('messages-read',{ sender_id:   id }), []);

  const markConversationRead = useCallback((userId) => {
    setUnreadMessages((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, [setUnreadMessages]);

  const clearNotificationCount = useCallback(() => {
    setUnreadNotifications(0);
  }, [setUnreadNotifications]);

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
