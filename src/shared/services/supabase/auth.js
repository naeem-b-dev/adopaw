import * as AuthSession from "expo-auth-session";
import { supabase } from "./client";

export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email, password) {
  return supabase.auth.signUp({ email, password });
}


export async function signInWithGoogle() {
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
    },
  });

  if (error) throw error;

  return data?.url; // return the auth URL
}


export async function signOut() {
  return supabase.auth.signOut();
}
