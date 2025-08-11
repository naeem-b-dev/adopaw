// src/shared/utils/supabaseErrorMapper.js

export const mapSupabaseErrorToTranslationKey = (message) => {
  switch (true) {
    case /Invalid login credentials/i.test(message):
      return "supabase.invalidCredentials";

    case /User already registered/i.test(message):
    case /Email address is already registered/i.test(message):
      return "supabase.userAlreadyRegistered";

    case /Email rate limit exceeded/i.test(message):
    case /Rate limit exceeded/i.test(message):
      return "supabase.emailRateLimit";

    case /Email not confirmed/i.test(message):
      return "supabase.emailNotConfirmed";

    case /Invalid email or password/i.test(message):
      return "supabase.invalidCredentials";

    case /User not found/i.test(message):
      return "supabase.userNotFound";

    case /Unable to validate email address/i.test(message):
      return "supabase.invalidEmail";

    case /Password should be at least 6 characters/i.test(message):
      return "supabase.weakPassword";

    case /Invalid token/i.test(message):
      return "supabase.invalidToken";

    case /Missing password/i.test(message):
      return "supabase.missingPassword";

    case /JWT expired/i.test(message):
      return "supabase.tokenExpired";

    case /Invalid login credentials or email not confirmed/i.test(message):
      return "supabase.emailNotConfirmedOrInvalid";

    default:
      return "supabase.generic";
  }
};
