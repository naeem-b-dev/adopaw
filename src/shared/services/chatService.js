// src/shared/services/chatService.js
// Frontend service layer for chats (Expo RN + Socket.IO + REST)
// Uses EXPO_PUBLIC_API_BASE for chat REST (set it to https://<host>/chat)
// Uses EXPO_PUBLIC_BACKEND_API_URL for Pawlo REST (under /chat-api)
// All auth flows accept a getToken() -> Promise<string> returning your JWT.

import { io } from "socket.io-client";

/**
 * @typedef {{ _id: string, chatId: string, senderId: string, role?: string, type: 'text'|'image', content: { text?: string, imageUrl?: string }, createdAt: string, status?: 'sending'|'sent'|'delivered'|'read' }} ChatMessage
 * @typedef {{ _id: string, participants?: string[], lastMessage?: ChatMessage|null, unreadCount?: number, lastMessageAt?: string|null, updatedAt?: string|null }} ChatSummary
 */

// ---------- Env resolution helpers ----------

function getApiBase() {
  // Preferred: EXPO_PUBLIC_API_BASE (e.g. https://host/chat)
  const baseA = process.env.EXPO_PUBLIC_API_BASE;
  if (baseA) return baseA.replace(/\/$/, "");

  // Fallback: EXPO_PUBLIC_BACKEND_API_URL + "/chat"
  const baseB = process.env.EXPO_PUBLIC_BACKEND_API_URL;
  if (baseB) return `${baseB.replace(/\/$/, "")}/chat`;

  throw new Error(
    "chatService: Missing API base. Set EXPO_PUBLIC_API_BASE to your /chat base or EXPO_PUBLIC_BACKEND_API_URL."
  );
}

// Pawlo lives under /chat-api
function getPawloBase() {
  const explicit = process.env.EXPO_PUBLIC_PAWLO_API_BASE;
  if (explicit) return explicit.replace(/\/$/, "");

  const be = process.env.EXPO_PUBLIC_BACKEND_API_URL;
  if (be) return `${be.replace(/\/$/, "")}/chat-api`;

  // If nothing set, reuse chat base and hope the backend mounted both under same prefix.
  return getApiBase();
}

function getWsBase() {
  const ws = process.env.EXPO_PUBLIC_WS_URL;
  if (ws) return ws;

  const api = getApiBase();
  try {
    const u = new URL(api);
    const proto = u.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${u.host}`;
  } catch {
    return "";
  }
}

// ---------- Socket singleton + auth token hook ----------

let socket = null;
/** @type {() => Promise<string>} */
let getTokenRef = async () => "";

// Simple readiness gate so early subscribers don't crash
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

/** Internal: authorized fetch wrapper (CHAT REST) */
async function fetchJSON(path, opts = {}, getToken) {
  const base = getApiBase();
  const token = await (getToken ? getToken() : getTokenRef());
  const res = await fetch(`${base}${path}`, {
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
export function initSocket(getToken) {
  getTokenRef = getToken;

  // Recreate if already connected
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const WS_BASE = getWsBase();
  if (!WS_BASE) {
    // You can still use REST without WS.
    return null;
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

  socket.on("connect_error", () => {
    // console.warn("socket connect_error", _err?.message);
  });

  _resolveReady();
  return socket;
}

// ---------- Chat list ----------

/**
 * REST: Get the current user's chats.
 * @param {() => Promise<string>} getToken
 * @returns {Promise<ChatSummary[]>}
 */
export function getUserChats(getToken) {
  return fetchJSON(`/me/chats`, { method: "GET" }, getToken).then((data) =>
    Array.isArray(data) ? data : data?.items || []
  );
}

/**
 * Socket: Subscribe to list invalidation (chat:list:dirty or message:any).
 * Your callback should refetch the list using getUserChats().
 * @param {() => void} cb
 * @returns {() => void} unsubscribe
 */
export function subscribeToUserChats(cb) {
  function attach() {
    const onDirty = () => cb && cb();
    const onAnyMsg = () => cb && cb();
    socket.on("chat:list:dirty", onDirty);
    socket.on("message:any", onAnyMsg);
    return () => {
      socket.off("chat:list:dirty", onDirty);
      socket.off("message:any", onAnyMsg);
    };
  }

  if (!socket) {
    let cancelled = false;
    let detach = () => {};
    _waitForSocket().then(() => {
      if (!cancelled && socket) detach = attach();
    });
    return () => {
      cancelled = true;
      detach && detach();
    };
  }

  return attach();
}

// ---------- Messages (history + live) ----------

/**
 * REST: Get paged messages for a chat. Cursor is `${createdAt}.${_id}` for stable pagination.
 * @param {string} chatId
 * @param {number} limit
 * @param {string|null} cursor  e.g., "1724150400000.66bc1a12e9..." or null
 * @param {() => Promise<string>} getToken
 * @returns {Promise<{ items: ChatMessage[], nextCursor: string|null }>}
 */
export async function getMessages(chatId, limit = 30, cursor = null, getToken) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));

  // our "ts.id" → backend expects ?cursorTs=&cursorId=
  if (cursor) {
    const [tsStr, id] = String(cursor).split(".");
    if (tsStr && id) {
      params.set("cursorTs", tsStr);
      params.set("cursorId", id);
    }
  }

  const data = await fetchJSON(
    `/chats/${encodeURIComponent(chatId)}/messages?${params.toString()}`,
    { method: "GET" },
    getToken
  );

  // backend returns newest→oldest; UI wants oldest→newest
  const itemsAsc = Array.isArray(data.items) ? [...data.items].reverse() : [];

  const nextCursor =
    data?.nextCursor?.ts && data?.nextCursor?.id
      ? `${data.nextCursor.ts}.${data.nextCursor.id}`
      : null;

  return { items: itemsAsc, nextCursor };
}

/**
 * Socket + rooms: subscribe to live messages for a chat. Joins/leaves room.
 * Listens on message:new:${chatId}, message:edit:${chatId}, message:delete:${chatId}
 * @param {string} chatId
 * @param {(event: { type: 'new'|'edit'|'delete', message?: ChatMessage, messageId?: string }) => void} cb
 * @returns {() => void} unsubscribe (leaves room and detaches listeners)
 */
export function subscribeToMessages(chatId, cb) {
  function attach() {
    const channelNew = `message:new:${chatId}`;
    const channelEdit = `message:edit:${chatId}`;
    const channelDelete = `message:delete:${chatId}`;

    const onNew = (message) => cb && cb({ type: "new", message });
    const onEdit = (message) => cb && cb({ type: "edit", message });
    const onDelete = (payload) =>
      cb && cb({ type: "delete", messageId: payload?._id || payload?.messageId });

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

  if (!socket) {
    let cancelled = false;
    let detach = () => {};
    _waitForSocket().then(() => {
      if (!cancelled && socket) detach = attach();
    });
    return () => {
      cancelled = true;
      detach && detach();
    };
  }

  return attach();
}

/**
 * REST: Send a message to a chat.
 * @param {string} chatId
 * @param {{ type:'text'|'image', content: { text?: string, imageUrl?: string } }} body
 * @param {() => Promise<string>} getToken
 * @returns {Promise<ChatMessage>}
 */
export function sendMessage(chatId, body, getToken) {
  return fetchJSON(
    `/chats/${encodeURIComponent(chatId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    getToken
  );
}

/**
 * Typing indicator
 */
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
export function subscribeToTyping(chatId, cb) {
  if (!socket) return () => {};
  const channel = `typing:${chatId}`;
  const handler = (payload) => cb && cb(payload);
  socket.on(channel, handler);
  return () => socket.off(channel, handler);
}

/**
 * REST: Mark messages as read (no-op if backend route not yet implemented)
 * @param {string} chatId
 * @param {string} messageId
 * @param {() => Promise<string>} getToken
 * @returns {Promise<{ ok: boolean }>}
 */
export async function markAsRead(chatId, messageId, getToken) {
  try {
    const res = await fetchJSON(
      `/chats/${encodeURIComponent(chatId)}/read`,
      {
        method: "POST",
        body: JSON.stringify({ messageId }),
      },
      getToken
    );
    return res;
  } catch {
    // Graceful no-op fallback
    return { ok: false };
  }
}

/**
 * Ensure (or create) a direct chat with a user and return { chatId }.
 * The server reads CURRENT_USER from JWT; we only pass the other participant.
 * @param {string} userId  the other participant (ownerId)
 * @param {() => Promise<string>} getToken
 * @returns {Promise<{ chatId: string, created?: boolean }>}
 */
export async function ensureDirectChatWith(userId, getToken) {
  const payload = { participants: [userId] }; // backend includes the requester automatically
  const data = await fetchJSON(
    `/chats`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    getToken
  );
  const chatId = data?.chatId || data?._id;
  if (!chatId) throw new Error("Failed to ensure direct chat: missing chatId");
  return { chatId, created: !!data?.created };
}

/**
 * Optional convenience if you already have an array of participants (besides self).
 * @param {string[]} participants
 * @param {() => Promise<string>} getToken
 * @returns {Promise<{ chatId: string, created?: boolean }>}
 */
export async function createOrGetChatWithParticipants(participants, getToken) {
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new Error("participants array required");
  }
  const data = await fetchJSON(
    `/chats`,
    { method: "POST", body: JSON.stringify({ participants }) },
    getToken
  );
  const chatId = data?.chatId || data?._id;
  if (!chatId) throw new Error("Failed to create/get chat: missing chatId");
  return { chatId, created: !!data?.created };
}

// ---------- Pawlo (uses /chat-api) ----------

/**
 * Pawlo: send text + optional images to the assistant
 * Accepts either:
 *   pawloReply(message, history?, getToken?, imageUrls?)
 *   pawloReply({ message, history, imageUrls }, getToken?)
 * Returns the assistant's text reply (string). Throws on non-2xx.
 */
export async function pawloReply(arg1, arg2 = [], arg3, arg4 = []) {
  let message, history, getToken, imageUrls;

  if (typeof arg1 === "object" && arg1 !== null && !Array.isArray(arg1)) {
    // object payload form
    message = arg1.message ?? "";
    history = Array.isArray(arg1.history) ? arg1.history : [];
    imageUrls = Array.isArray(arg1.imageUrls) ? arg1.imageUrls : [];
    getToken = arg2; // second param is the getter
  } else {
    // positional form
    message = arg1 ?? "";
    history = Array.isArray(arg2) ? arg2 : [];
    getToken = arg3;
    imageUrls = Array.isArray(arg4) ? arg4 : [];
  }

  const apiBase = getPawloBase(); // absolute base, e.g. https://.../chat-api
  const token = getToken ? await getToken() : await getTokenRef();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Clean inputs
  const images = (Array.isArray(imageUrls) ? imageUrls : []).filter(
    (u) => typeof u === "string" && u.trim()
  );
  const text =
    (message && String(message).trim()) ||
    (images.length ? "Please consider the attached image(s)." : "");

  if (!text && images.length === 0) {
    throw new Error("pawloReply: message or imageUrls required");
  }

  const body = JSON.stringify({ message: text, history, imageUrls: images });

  const tryOnce = async (url) => {
    try {
      const res = await fetch(url, { method: "POST", headers, body });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        const retriable = res.status === 404 || res.status === 405;
        const err = new Error(`pawloReply ${res.status} ${res.statusText}: ${txt}`);
        err.retriable = retriable;
        throw err;
      }
      const data = await res.json();
      return data?.reply || "";
    } catch (err) {
      console.warn("[PAWLO] fetch failed:", err?.message || err);
      throw err;
    }
  };

  try {
    return await tryOnce(`${apiBase}/pawlo/reply`);
  } catch (e) {
    if (e.retriable) {
      return await tryOnce(`${apiBase}/reply`);
    }
    throw e;
  }
}
