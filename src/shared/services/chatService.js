// src/shared/services/chatService.js
// Frontend service layer for chats (Expo RN + Socket.IO + REST)

import { io } from "socket.io-client";

/**
 * @typedef {{ _id: string, chatId: string, senderId: string, role?: string, type: 'text'|'image', content: { text?: string, imageUrl?: string }, createdAt: string, status?: 'sending'|'sent'|'delivered'|'read' }} ChatMessage
 * @typedef {{ _id: string, participants?: string[], lastMessage?: ChatMessage|null, unreadCount?: number, lastMessageAt?: string|null, updatedAt?: string|null, peer?: any, petId?: string|null }} ChatSummary
 */

// ---------- Env helpers ----------
function getApiBase() {
  const baseA = process.env.EXPO_PUBLIC_API_BASE;
  if (baseA) return baseA.replace(/\/$/, "");
  const be = process.env.EXPO_PUBLIC_BACKEND_API_URL;
  if (be) return `${be.replace(/\/$/, "")}/chat-api`;
  throw new Error("chatService: Missing API base. Set EXPO_PUBLIC_API_BASE.");
}
function getPawloBase() {
  const explicit = process.env.EXPO_PUBLIC_PAWLO_API_BASE;
  if (explicit) return explicit.replace(/\/$/, "");
  const be = process.env.EXPO_PUBLIC_BACKEND_API_URL;
  if (be) return `${be.replace(/\/$/, "")}/chat`;
  return getApiBase();
}
function getWsBase() {
  const ws = process.env.EXPO_PUBLIC_WS_URL;
  if (ws) return ws; // e.g. https://api.example.com
  const api = getApiBase();
  try {
    const u = new URL(api);
    const proto = u.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${u.host}`; // default Socket.IO path /socket.io
  } catch {
    return "";
  }
}

// ---------- Socket singleton ----------
let socket = null;
/** @type {() => Promise<string>} */
let getTokenRef = async () => "";

// readiness gate so early subscribers don't crash
let _readyResolvers = [];
function _resolveReady() {
  _readyResolvers.forEach((r) => r());
  _readyResolvers = [];
}
function _waitForSocket() {
  if (socket) return Promise.resolve();
  return new Promise((res) => _readyResolvers.push(res));
}

// authorized fetch wrapper (CHAT REST)
async function fetchJSON(path, opts = {}, getToken) {
  const base = getApiBase();
  const token = await (getToken ? getToken() : getTokenRef());
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${txt || url}`);
  }
  return res.json();
}

/**
 * Initialize the singleton Socket.IO client.
 * IMPORTANT: set socket.auth BEFORE connect (server reads handshake.auth.token).
 * @param {() => Promise<string>} getToken
 */
export async function initSocket(getToken) {
  getTokenRef = getToken;

  if (socket) {
    try {
      socket.offAny();
    } catch {}
    socket.disconnect();
    socket = null;
  }

  const WS_BASE = getWsBase();
  if (!WS_BASE) return null; // REST-only fallback is fine

  socket = io(WS_BASE, {
    transports: ["websocket"],
    autoConnect: false, // we connect after setting auth
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelayMax: 5000,
    // path: "/socket.io", // set both sides if you customize
  });

  try {
    const token = await getTokenRef();
    socket.auth = { token };
  } catch {
    socket.auth = { token: "" };
  }
  socket.connect();

  // refresh token on reconnect attempts
  socket.io.on("reconnect_attempt", async () => {
    try {
      const fresh = await getTokenRef();
      socket.auth = { token: fresh };
    } catch {
      socket.auth = { token: "" };
    }
  });

  _resolveReady();
  return socket;
}

// ---------- Chat list ----------
export async function getUserChats(getToken) {
  return fetchJSON(`/me/chats`, { method: "GET" }, getToken).then((data) =>
    Array.isArray(data?.items) ? data.items : []
  );
}

/**
 * Subscribe to list invalidation (debounced refetch).
 * Your callback should refetch using getUserChats().
 */
export function subscribeToUserChats(cb) {
  // debounce to avoid refetch spam
  let timer = null;
  const ping = () => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      cb && cb();
    }, 250);
  };

  function attach() {
    const onUpdate = () => ping();
    const onTouch = () => ping();
    const onNew = () => ping();

    socket.on("chat:list:update", onUpdate);
    socket.on("chat:touch", onTouch);
    socket.on("chat:new", onNew);

    // legacy
    socket.on("chat:list:dirty", onUpdate);
    socket.on("message:any", onUpdate);

    return () => {
      socket.off("chat:list:update", onUpdate);
      socket.off("chat:touch", onTouch);
      socket.off("chat:new", onNew);
      socket.off("chat:list:dirty", onUpdate);
      socket.off("message:any", onUpdate);
    };
  }

  if (!socket) {
    let cancelled = false,
      detach = () => {};
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
 * NEW: Subscribe to raw chat events for optimistic UI updates.
 * handlers: { onUpdate?, onTouch?, onNew? }
 */
export function subscribeToUserChatEvents(handlers = {}) {
  const { onUpdate, onTouch, onNew } = handlers;

  function attach() {
    const hUpdate = (p) => onUpdate?.(p);
    const hTouch = (p) => onTouch?.(p);
    const hNew = (p) => onNew?.(p);

    socket.on("chat:list:update", hUpdate);
    socket.on("chat:touch", hTouch);
    socket.on("chat:new", hNew);

    return () => {
      socket.off("chat:list:update", hUpdate);
      socket.off("chat:touch", hTouch);
      socket.off("chat:new", hNew);
    };
  }

  if (!socket) {
    let cancelled = false,
      detach = () => {};
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
export async function getMessages(chatId, limit = 30, cursor = null, getToken) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
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

  const itemsAsc = Array.isArray(data.items) ? [...data.items].reverse() : [];
  const nextCursor =
    data?.nextCursor?.ts && data?.nextCursor?.id
      ? `${data.nextCursor.ts}.${data.nextCursor.id}`
      : null;

  return { items: itemsAsc, nextCursor };
}

export function subscribeToMessages(chatId, cb) {
  function attach() {
    const channelNew = `message:new:${chatId}`;
    const channelEdit = `message:edit:${chatId}`;
    const channelDelete = `message:delete:${chatId}`;

    const onNew = (message) => cb && cb({ type: "new", message });
    const onEdit = (message) => cb && cb({ type: "edit", message });
    const onDelete = (payload) =>
      cb &&
      cb({ type: "delete", messageId: payload?._id || payload?.messageId });

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
    let cancelled = false,
      detach = () => {};
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

export function sendMessage(chatId, body, getToken) {
  return fetchJSON(
    `/chats/${encodeURIComponent(chatId)}/messages`,
    { method: "POST", body: JSON.stringify(body) },
    getToken
  );
}

/** Typing indicator (socket) */
export function setTyping(chatId, isTyping) {
  if (!socket) return;
  socket.emit("typing", { chatId, isTyping });
}

/** Subscribe to typing events */
export function subscribeToTyping(chatId, cb) {
  if (!socket) return () => {};
  const channel = `typing:${chatId}`;
  const handler = (payload) => cb && cb(payload);
  socket.on(channel, handler);
  return () => socket.off(channel, handler);
}

/** REST: persist read receipt (best-effort) */
export async function markAsRead(chatId, messageId, getToken) {
  try {
    const res = await fetchJSON(
      `/chats/${encodeURIComponent(chatId)}/read`,
      { method: "POST", body: JSON.stringify({ messageId }) },
      getToken
    );
    return res;
  } catch {
    return { ok: false };
  }
}

/** NEW: Socket: emit read so list updates in realtime */
export function sendReadSocket(chatId, messageId) {
  if (!socket) return;
  socket.emit("read", { chatId, messageId });
}

/** Ensure or create a direct chat with a user and return { chatId } */
export async function ensureDirectChatWith(otherUserId, getToken) {
  const data = await fetchJSON(
    `/chats/ensure`,
    {
      method: "POST",
      body: JSON.stringify({ otherUserId: String(otherUserId) }),
    },
    getToken
  );
  const chatId = data?.chatId || data?._id;
  if (!chatId) throw new Error("Failed to ensure direct chat: missing chatId");
  return { chatId, created: !!data?.created };
}

/** Create or get chat by participants (pet-aware) */
export async function createOrGetChatWithParticipants(
  { petId, otherUserId },
  getToken
) {
  const payload = { otherUserId: String(otherUserId) };
  if (petId) payload.petId = String(petId);
  const data = await fetchJSON(
    `/chats/ensure`,
    { method: "POST", body: JSON.stringify(payload) },
    getToken
  );
  const chatId = data?.chatId || data?._id;
  if (!chatId) throw new Error("Missing chatId");
  return { chatId, created: !!data?.created };
}

// ---------- Pawlo (assistant, uses /chat) ----------
export async function pawloReply(arg1, arg2 = [], arg3, arg4 = []) {
  let message, history, getToken, imageUrls;

  if (typeof arg1 === "object" && arg1 !== null && !Array.isArray(arg1)) {
    message = arg1.message ?? "";
    history = Array.isArray(arg1.history) ? arg1.history : [];
    imageUrls = Array.isArray(arg1.imageUrls) ? arg1.imageUrls : [];
    getToken = arg2;
  } else {
    message = arg1 ?? "";
    history = Array.isArray(arg2) ? arg2 : [];
    getToken = arg3;
    imageUrls = Array.isArray(arg4) ? arg4 : [];
  }

  const apiBase = getPawloBase();
  const token = getToken ? await getToken() : await getTokenRef();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

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
    const res = await fetch(url, { method: "POST", headers, body });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      const retriable = res.status === 404 || res.status === 405;
      const err = new Error(
        `pawloReply ${res.status} ${res.statusText}: ${txt}`
      );
      err.retriable = retriable;
      throw err;
    }
    const data = await res.json();
    return data?.reply || "";
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
