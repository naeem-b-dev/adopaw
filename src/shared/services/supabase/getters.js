// src/utils/getAuthToken.js

import { supabase } from "./client";

export const getAuthToken = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to get session:", error.message);
    return null;
  }

  return session?.access_token || null;
};

export const getSupaId = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to get session:", error.message);
    return null;
  }

  return session?.user?.id || null;
};

export const getAuthInfo = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to get session:", error.message);
    return { token: null, supaId: null };
  }

  return {
    token: session?.access_token || null,
    supaId: session?.user?.id || null,
  };
};

export const getSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return session || null;
  } catch (error) {
    console.error("Failed to get session:", error.message);
    return null;
  }
};
