// src/features/auth/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

/**
 * Auth state keeps the Supabase session essentials:
 * - userId: Supabase UUID
 * - jwt: Supabase access_token (JWT)
 * - isAuthed: convenience flag
 */
const initialState = {
  userId: null,
  jwt: null,
  isAuthed: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Set both userId and jwt explicitly (manual login) */
    setSession(state, action) {
      const { userId, jwt } = action.payload || {};
      state.userId = userId ?? null;
      state.jwt = jwt ?? null;
      state.isAuthed = !!jwt;
    },
    /** Bridge directly from a Supabase session object */
    setSupabaseSession(state, action) {
      const session = action.payload;
      state.userId = session?.user?.id ?? null;
      state.jwt = session?.access_token ?? null;
      state.isAuthed = !!session?.access_token;
    },
    clearSession(state) {
      state.userId = null;
      state.jwt = null;
      state.isAuthed = false;
    },
  },
});

export const { setSession, setSupabaseSession, clearSession } = authSlice.actions;
export default authSlice.reducer;

/** Selectors */
export const selectUserId = (s) => s.auth.userId;
export const selectJwt = (s) => s.auth.jwt;
export const selectIsAuthed = (s) => s.auth.isAuthed;
