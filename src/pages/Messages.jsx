import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API from '../api/axios';
import UserLayout from '../components/UserLayout';
import toast from 'react-hot-toast';
import {
  Search, Send, Image, Mic, MicOff, Play, Pause, ArrowLeft,
  MessageSquare, Phone, Video, MoreVertical, Check, CheckCheck, X,
} from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const { socket, onlineUsers, lastIncomingMessage, typingUsers, emitTyping, emitStopTyping, emitMessagesRead, markConversationRead } = useSocket();

  // ─── State ────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  // Audio playback state
  const [playingAudio, setPlayingAudio] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const audioRefs = useRef({});

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // ─── Fetch Conversation List ──────────────────────────────────────
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/message/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoadingConvos(false);
    }
  };

  // ─── Listen for incoming messages ─────────────────────────────────
  useEffect(() => {
    if (!lastIncomingMessage) return;
    const msg = lastIncomingMessage;

    // If we're currently chatting with this sender, add to messages
    if (selectedUser && msg.sender_id === selectedUser._id) {
      setMessages((prev) => [...prev, msg]);
      // Mark as read immediately
      API.put(`/message/read/${msg.sender_id}`).catch(() => {});
      emitMessagesRead(msg.sender_id);
      markConversationRead(msg.sender_id);
    }

    // Update conversation list
    setConversations((prev) => {
      const exists = prev.find((c) => c.user?._id === msg.sender_id);
      if (exists) {
        return prev.map((c) =>
          c.user?._id === msg.sender_id
            ? {
                ...c,
                lastMessage: msg.message_type === 'image' ? '📷 Photo' : msg.message_type === 'voice' ? '🎙️ Voice note' : msg.message,
                lastMessageAt: msg.createdAt,
                unreadCount: selectedUser?._id === msg.sender_id ? 0 : c.unreadCount + 1,
              }
            : c
        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      }
      return prev;
    });
  }, [lastIncomingMessage]);

  // ─── Select a conversation ────────────────────────────────────────
  const selectConversation = async (convUser) => {
    setSelectedUser(convUser);
    setMobileShowChat(true);
    setLoadingMessages(true);
    setMessages([]);

    try {
      const res = await API.get(`/message/${convUser._id}`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
      // Mark messages as read
      await API.put(`/message/read/${convUser._id}`);
      emitMessagesRead(convUser._id);
      markConversationRead(convUser._id);

      // Clear unread in conversation list
      setConversations((prev) =>
        prev.map((c) => c.user?._id === convUser._id ? { ...c, unreadCount: 0 } : c)
      );
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // ─── Auto scroll to bottom ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Send text message ────────────────────────────────────────────
  const sendTextMessage = async () => {
    if (!text.trim() || !selectedUser || sending) return;
    setSending(true);

    try {
      const res = await API.post('/message/send', {
        receiver_id: selectedUser._id,
        message: text.trim(),
        message_type: 'text',
      });

      if (res.data.success) {
        const newMsg = res.data.data;
        setMessages((prev) => [...prev, newMsg]);
        setText('');
        if (textareaRef.current) textareaRef.current.style.height = '40px';

        // Update conversation list
        setConversations((prev) => {
          const exists = prev.find((c) => c.user?._id === selectedUser._id);
          if (exists) {
            return prev.map((c) =>
              c.user?._id === selectedUser._id
                ? { ...c, lastMessage: text.trim(), lastMessageAt: newMsg.createdAt }
                : c
            ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
          }
          return [
            { user: selectedUser, lastMessage: text.trim(), lastMessageAt: newMsg.createdAt, unreadCount: 0, isOnline: onlineUsers.has(selectedUser._id) },
            ...prev,
          ];
        });

        // Emit socket event
        socket?.emit('send-message', {
          receiver_id: selectedUser._id,
          message: text.trim(),
          message_type: 'text',
          _id: newMsg._id,
          createdAt: newMsg.createdAt,
        });
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ─── Send image ───────────────────────────────────────────────────
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setSending(true);
      try {
        // Upload to Cloudinary
        const uploadRes = await API.post('/upload/image', { base64 });
        if (!uploadRes.data.success) throw new Error('Upload failed');

        // Send message
        const res = await API.post('/message/send', {
          receiver_id: selectedUser._id,
          message: '',
          message_type: 'image',
          media_url: uploadRes.data.url,
        });

        if (res.data.success) {
          const newMsg = res.data.data;
          setMessages((prev) => [...prev, newMsg]);

          setConversations((prev) =>
            prev.map((c) =>
              c.user?._id === selectedUser._id
                ? { ...c, lastMessage: '📷 Photo', lastMessageAt: newMsg.createdAt }
                : c
            ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
          );

          socket?.emit('send-message', {
            receiver_id: selectedUser._id,
            message: '',
            message_type: 'image',
            media_url: uploadRes.data.url,
            _id: newMsg._id,
            createdAt: newMsg.createdAt,
          });
        }
      } catch (err) {
        toast.error('Failed to send image');
      } finally {
        setSending(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ─── Voice Recording ─────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Convert to base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result;
          setSending(true);
          try {
            const uploadRes = await API.post('/upload/audio', { base64 });
            if (!uploadRes.data.success) throw new Error('Upload failed');

            const res = await API.post('/message/send', {
              receiver_id: selectedUser._id,
              message: '',
              message_type: 'voice',
              media_url: uploadRes.data.url,
            });

            if (res.data.success) {
              const newMsg = res.data.data;
              setMessages((prev) => [...prev, newMsg]);

              setConversations((prev) =>
                prev.map((c) =>
                  c.user?._id === selectedUser._id
                    ? { ...c, lastMessage: '🎙️ Voice note', lastMessageAt: newMsg.createdAt }
                    : c
                ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
              );

              socket?.emit('send-message', {
                receiver_id: selectedUser._id,
                message: '',
                message_type: 'voice',
                media_url: uploadRes.data.url,
                _id: newMsg._id,
                createdAt: newMsg.createdAt,
              });
            }
          } catch (err) {
            toast.error('Failed to send voice note');
          } finally {
            setSending(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
    clearInterval(recordingIntervalRef.current);
  };

  // ─── Audio Playback ───────────────────────────────────────────────
  const toggleAudio = (msgId, url) => {
    if (playingAudio === msgId) {
      audioRefs.current[msgId]?.pause();
      setPlayingAudio(null);
      return;
    }

    // Pause any currently playing audio
    if (playingAudio && audioRefs.current[playingAudio]) {
      audioRefs.current[playingAudio].pause();
    }

    if (!audioRefs.current[msgId]) {
      const audio = new Audio(url);
      audio.ontimeupdate = () => {
        setAudioProgress((prev) => ({ ...prev, [msgId]: (audio.currentTime / audio.duration) * 100 }));
      };
      audio.onended = () => {
        setPlayingAudio(null);
        setAudioProgress((prev) => ({ ...prev, [msgId]: 0 }));
      };
      audioRefs.current[msgId] = audio;
    }

    audioRefs.current[msgId].play();
    setPlayingAudio(msgId);
  };

  // ─── Typing Handler ──────────────────────────────────────────────
  const handleTyping = () => {
    if (!selectedUser) return;
    emitTyping(selectedUser._id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(selectedUser._id);
    }, 1500);
  };

  // ─── Helpers ──────────────────────────────────────────────────────
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRecordingTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const filteredConvos = conversations.filter((c) =>
    c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isUserOnline = (userId) => onlineUsers.has(userId);
  const isTyping = selectedUser && typingUsers.has(selectedUser._id);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <UserLayout>
      <div className="chat-container">
        {/* ═══ Left Sidebar: Conversation List ═══════════════════════ */}
        <div className={`chat-sidebar ${mobileShowChat ? 'chat-sidebar-hidden' : ''}`}>
          {/* Search Header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>Messages</h2>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--color-text-muted)' }} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                style={{
                  width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  background: 'var(--color-input)', border: '1px solid var(--color-border)',
                  borderRadius: '0.625rem', fontSize: '0.8125rem', outline: 'none',
                  fontFamily: 'var(--font-body)', color: 'var(--color-text)',
                }}
              />
            </div>
          </div>

          {/* Conversation List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvos ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)', margin: '0 auto' }} />
              </div>
            ) : filteredConvos.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: 'var(--color-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <MessageSquare style={{ width: '24px', height: '24px', color: 'var(--color-brand)' }} />
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text)' }}>No conversations yet</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Start by requesting a resource!</p>
              </div>
            ) : (
              filteredConvos.map((conv) => {
                const u = conv.user;
                if (!u) return null;
                const online = isUserOnline(u._id);
                return (
                  <div
                    key={u._id}
                    className={`conv-item ${selectedUser?._id === u._id ? 'conv-item-active' : ''}`}
                    onClick={() => selectConversation(u)}
                  >
                    <div className="conv-avatar">
                      {u.profile_image ? (
                        <img src={u.profile_image} alt={u.name} />
                      ) : (
                        u.name?.charAt(0)?.toUpperCase() || '?'
                      )}
                      {online && <div className="online-dot online-dot-pulse" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{u.name}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                          {conv.lastMessageAt && formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.125rem' }}>
                        <span style={{
                          fontSize: '0.75rem', color: 'var(--color-text-muted)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px',
                        }}>
                          {conv.lastMessage || 'Start a conversation'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="sidebar-badge" style={{ fontSize: '0.6rem', minWidth: '16px', height: '16px' }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ═══ Right Panel: Chat Window ══════════════════════════════ */}
        <div className={`chat-main ${!mobileShowChat ? 'chat-main-hidden' : ''}`}>
          {!selectedUser ? (
            // Empty state
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', maxWidth: '320px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '1.25rem', background: 'var(--color-brand-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <MessageSquare style={{ width: '32px', height: '32px', color: 'var(--color-brand)' }} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                  Select a conversation
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Choose from your existing chats or start a new conversation from a resource page
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1.25rem', background: 'var(--color-card)',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <button className="chat-action-btn" onClick={() => { setMobileShowChat(false); setSelectedUser(null); }} style={{ display: 'none' }} className="mobile-back-btn">
                  <ArrowLeft style={{ width: '20px', height: '20px' }} />
                </button>
                <div className="conv-avatar" style={{ width: '40px', height: '40px', fontSize: '0.85rem' }}>
                  {selectedUser.profile_image ? (
                    <img src={selectedUser.profile_image} alt={selectedUser.name} />
                  ) : (
                    selectedUser.name?.charAt(0)?.toUpperCase()
                  )}
                  {isUserOnline(selectedUser._id) && <div className="online-dot" style={{ width: '10px', height: '10px' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)' }}>{selectedUser.name}</div>
                  <div style={{ fontSize: '0.7rem', color: isUserOnline(selectedUser._id) ? '#10b981' : 'var(--color-text-muted)' }}>
                    {isTyping ? 'typing...' : isUserOnline(selectedUser._id) ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {loadingMessages ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      No messages yet. Say hello! 👋
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = (msg.sender_id?._id || msg.sender_id) === user?._id;
                    return (
                      <div key={msg._id} className={`chat-bubble ${isMine ? 'chat-bubble-mine' : 'chat-bubble-other'}`}>
                        {/* Text message */}
                        {msg.message_type === 'text' && <div>{msg.message}</div>}

                        {/* Image message */}
                        {msg.message_type === 'image' && (
                          <img
                            src={msg.media_url}
                            alt="Shared image"
                            className="chat-image"
                            onClick={() => window.open(msg.media_url, '_blank')}
                          />
                        )}

                        {/* Voice message */}
                        {msg.message_type === 'voice' && (
                          <div className={`voice-note-player ${!isMine ? 'voice-note-other' : ''}`}>
                            <button
                              className="voice-note-btn"
                              onClick={() => toggleAudio(msg._id, msg.media_url)}
                            >
                              {playingAudio === msg._id ? (
                                <Pause style={{ width: '16px', height: '16px' }} />
                              ) : (
                                <Play style={{ width: '16px', height: '16px' }} />
                              )}
                            </button>
                            <div className="voice-note-bar">
                              <div className="voice-note-progress" style={{ width: `${audioProgress[msg._id] || 0}%` }} />
                            </div>
                          </div>
                        )}

                        <span className="msg-timestamp">{formatTime(msg.createdAt)}</span>
                      </div>
                    );
                  })
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="chat-bubble chat-bubble-other" style={{ padding: '0.5rem 0.875rem' }}>
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div className="chat-input-bar">
                {isRecording ? (
                  <>
                    <button className="chat-action-btn" onClick={cancelRecording} style={{ color: 'var(--color-danger)' }}>
                      <X style={{ width: '20px', height: '20px' }} />
                    </button>
                    <div className="recording-indicator">
                      <div className="recording-dot" />
                      <span className="recording-timer">{formatRecordingTime(recordingTime)}</span>
                      <div className="recording-waves">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className="recording-wave-bar" style={{ animationDelay: `${i * 0.05}s`, height: `${4 + Math.random() * 16}px` }} />
                        ))}
                      </div>
                    </div>
                    <button className="chat-send-btn" onClick={stopRecording}>
                      <Send style={{ width: '18px', height: '18px' }} />
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleImageSelect}
                    />
                    <button className="chat-action-btn" onClick={() => fileInputRef.current?.click()} disabled={sending}>
                      <Image style={{ width: '20px', height: '20px' }} />
                    </button>
                    <textarea
                      ref={textareaRef}
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        handleTyping();
                        e.target.style.height = '40px';
                        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendTextMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                    />
                    {text.trim() ? (
                      <button className="chat-send-btn" onClick={sendTextMessage} disabled={sending}>
                        <Send style={{ width: '18px', height: '18px' }} />
                      </button>
                    ) : (
                      <button className="chat-action-btn" onClick={startRecording} disabled={sending} style={{ color: 'var(--color-brand)' }}>
                        <Mic style={{ width: '20px', height: '20px' }} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-back-btn { display: flex !important; }
        }
      `}</style>
    </UserLayout>
  );
};

export default Messages;
