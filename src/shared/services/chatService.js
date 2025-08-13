// src/services/chatService.js
// Frontend service layer for chats (Expo RN + Socket.IO + REST)
// JavaScript only. Uses EXPO_PUBLIC_API_BASE and EXPO_PUBLIC_WS_URL.
// All auth flows accept a getToken() -> Promise<string> that returns the Supabase JWT.

import { io } from "socket.io-client";

/**
 * @typedef {{ _id: string, chatId: string, senderId: string, role?: string, type: 'text'|'image', content: { text?: string, imageUrl?: string }, createdAt: string, status?: 'sending'|'sent'|'delivered'|'read' }} ChatMessage
 * @typedef {{ _id: string, participants: string[], lastMessage?: ChatMessage, unreadCount?: number, updatedAt: string }} ChatSummary
 */

const API_BASE = process.env.EXPO_PUBLIC_API_BASE; // e.g., http://<LAN-IP>:5000/chat-api
const WS_BASE  = process.env.EXPO_PUBLIC_WS_URL;   // e.g., ws://<LAN-IP>:5000

let socket = null;
/** @type {() => Promise<string>} */
let getTokenRef = async () => "";

/** Internal: authorized fetch wrapper */
async function fetchJSON(path, opts = {}, getToken) {
  const token = await (getToken ? getToken() : getTokenRef());
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${txt || path}`);
  }
  return res.json();
}

/**
 * Initialize the singleton Socket.IO client.
 * Call once (when you have a valid session token) and again if session changes.
 * @param {() => Promise<string>} getToken
 */

// ---- readiness helpers ----
let _readyResolvers = [];
function _resolveReady() {
  if (_readyResolvers.length) {
    _readyResolvers.forEach((r) => r());
    _readyResolvers = [];
  }
}
function _waitForSocket() {
  if (socket) return Promise.resolve();
  return new Promise((res) => _readyResolvers.push(res));
}
export function initSocket(getToken) {
  getTokenRef = getToken;

  // If already connected, update auth and reconnect
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(WS_BASE, {
    transports: ["websocket"],
    autoConnect: true,
    forceNew: true,
    auth: async (cb) => {
      try {
        const token = await getTokenRef();
        cb({ token });
      } catch {
        cb({ token: "" });
      }
    },
  });
_resolveReady();
  socket.on("connect_error", (err) => {
    // console.warn("socket connect_error", err?.message);
  });

  return socket;
}

/**
 * REST: Get the current user's chats.
 * @param {() => Promise<string>} getToken
 * @returns {Promise<ChatSummary[]>}
 */
export function getUserChats(getToken) {
  return fetchJSON(`/me/chats`, { method: "GET" }, getToken);
}

/**
 * Socket: Subscribe to list invalidation (chat:list:dirty or message:any).
 * Your callback should refetch the list using getUserChats().
 * @param {() => void} cb
 * @returns {() => void} unsubscribe
 */
export function subscribeToUserChats(cb) {
    if (!socket) {
    // Defer attaching until socket exists
    let cancelled = false;
    _waitForSocket().then(() => {
      if (!cancelled && socket) {
        unsub = _attach();
      }
    });
    let unsub = () => { cancelled = true; };
    const noop = () => {};
    return () => (unsub ? unsub() : noop());
  }
  return _attach();

  function _attach() {
    const onDirty  = () => cb && cb();
    const onAnyMsg = () => cb && cb();
    socket.on("chat:list:dirty", onDirty);
    socket.on("message:any", onAnyMsg);
    return () => {
      socket.off("chat:list:dirty", onDirty);
      socket.off("message:any", onAnyMsg);
    };
  }

  return () => {
    socket.off("chat:list:dirty", onDirty);
    socket.off("message:any", onAnyMsg);
  };
}

/**
 * REST: Get paged messages for a chat. Cursor is `${createdAt}.${_id}` for stable pagination.
 * @param {string} chatId
 * @param {number} limit
 * @param {string|null} cursor  e.g., "2025-08-10T10:00:00.000Z.66bc1a12e9..." or null
 * @param {() => Promise<string>} getToken
 * @returns {Promise<{ items: ChatMessage[], nextCursor: string|null }>}
 */
export async function getMessages(chatId, limit = 30, cursor = null, getToken) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);

  const data = await fetchJSON(`/chats/${encodeURIComponent(chatId)}/messages?${params.toString()}`, { method: "GET" }, getToken);

  // Expect server returns { items: [...], nextCursor: string|null }
  return data;
}

/**
 * Socket + rooms: subscribe to live messages for a chat. Joins/leaves room.
 * Listens on message:new:${chatId}, message:edit:${chatId}, message:delete:${chatId}
 * @param {string} chatId
 * @param {(event: { type: 'new'|'edit'|'delete', message?: ChatMessage, messageId?: string }) => void} cb
 * @returns {() => void} unsubscribe (leaves room and detaches listeners)
 */
export function subscribeToMessages(chatId, cb) {
  if (!socket) {
    let cancelled = false;
   let detach = () => {};
    _waitForSocket().then(() => {
      if (!cancelled && socket) detach = _attach();
    });
    return () => { cancelled = true; detach && detach(); };
  }
  return _attach();

  function _attach() {
    const channelNew    = `message:new:${chatId}`;
    const channelEdit   = `message:edit:${chatId}`;
    const channelDelete = `message:delete:${chatId}`;
    const onNew    = (message) => cb && cb({ type: "new", message });
    const onEdit   = (message) => cb && cb({ type: "edit", message });
    const onDelete = (payload) => cb && cb({ type: "delete", messageId: payload?._id || payload?.messageId });
    socket.emit("chat:join", { chatId });
    socket.on(channelNew, onNew);
    socket.on(channelEdit, onEdit);
    socket.on(channelDelete, onDelete);
    return () => {
      socket.emit("chat:leave", { chatId });
      socket.off(channelNew, onNew);
      socket.off(channelEdit, onEdit);
      socket.off(channelDelete, onDelete);
    };
  }
}

/**
 * REST: Send a message to a chat.
 * @param {string} chatId
 * @param {{ type:'text'|'image', content: { text?: string, imageUrl?: string } }} body
 * @param {() => Promise<string>} getToken
 * @returns {Promise<ChatMessage>}
 */
export function sendMessage(chatId, body, getToken) {
  return fetchJSON(`/chats/${encodeURIComponent(chatId)}/messages`, {
    method: "POST",
    body: JSON.stringify(body),
  }, getToken);
}

/**
 * Socket: typing indicator
 * @param {string} chatId
 * @param {boolean} isTyping
 */
export function subscribeToTyping(chatId, cb) {
  // If socket isn't ready yet, just no-op (prevents crashes).
  if (!socket) return () => {};

  const channel = `typing:${chatId}`; // ✅ template string
  const handler = (payload) => cb && cb(payload);
  socket.on(channel, handler);
  return () => socket.off(channel, handler);
}

export function setTyping(chatId, isTyping) {
  if (!socket) return;
  socket.emit("typing", { chatId, isTyping });
}

/**
 * Socket: subscribe to typing events for a chat.
 * Server should emit `typing:${chatId}` with { chatId, userId, isTyping }.
 * @param {string} chatId
 * @param {(evt: { chatId: string, userId: string, isTyping: boolean }) => void} cb
 * @returns {() => void} unsubscribe
 */

/**
 * REST: Mark messages as read (no-op if backend route not yet implemented)
 * @param {string} chatId
 * @param {string} messageId
 * @param {() => Promise<string>} getToken
 * @returns {Promise<{ ok: boolean }>}
 */
export async function markAsRead(chatId, messageId, getToken) {
  try {
    const res = await fetchJSON(`/chats/${encodeURIComponent(chatId)}/read`, {
      method: "POST",
      body: JSON.stringify({ messageId }),
    }, getToken);
    return res;
  } catch {
    // Graceful no-op fallback
    return { ok: false };
  }
}

/**
 * Business rule helper: Ensure (or create) a direct chat with a user and return { chatId }.
 * The server will either create or return an existing chat between CURRENT_USER and userId.
 * @param {string} userId  the other participant (ownerId)
 * @param {() => Promise<string>} getToken
 * @returns {Promise<{ chatId: string }>}
 */
export async function ensureDirectChatWith(userId, getToken) {
  const token = await (getToken || getTokenRef)();
  // We don't derive CURRENT_USER_ID here; server reads it from JWT.
  const payload = { participants: [/* current user (from JWT) */, userId] };
  const data = await fetchJSON(`/chats`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, async () => token);
  // Expect server returns { _id: string } or { chatId: string }
  const chatId = data?.chatId || data?._id;
  if (!chatId) throw new Error("Failed to ensure direct chat: missing chatId");
  return { chatId };
}
