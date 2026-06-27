import * as AppleAuthentication from "expo-apple-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";

import {
  type AuthUser,
  getSession,
  sendEmailOtp as sendEmailOtpRequest,
  signInWithEmailOtp as signInWithEmailOtpRequest,
  signInWithSocialToken,
  signOut as signOutRequest,
} from "../api/auth";

const SESSION_TOKEN_KEY = "better-auth-session-token";

type GoogleSignInModule =
  typeof import("@react-native-google-signin/google-signin");

let googleConfiguredClientId: string | null = null;

export type AuthSessionState = {
  sessionToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isWorking: boolean;
  statusMessage: string | null;
  isAuthenticated: boolean;
  bootstrapSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendEmailOtp: (email: string) => Promise<void>;
  signInWithEmailOtp: (email: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthSessionStore = create<AuthSessionState>((set, get) => ({
  sessionToken: null,
  user: null,
  isLoading: true,
  isWorking: false,
  statusMessage: null,
  isAuthenticated: false,
  bootstrapSession: async () => {
    set({ isLoading: true, statusMessage: "Checking your session…" });

    try {
      const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);

      if (!token) {
        clearAuthState(set, { isLoading: false });
        return;
      }

      set({ sessionToken: token });
      await get().refreshSession();
    } catch (error) {
      await clearStoredSession();
      clearAuthState(set, {
        isLoading: false,
        statusMessage: readErrorMessage(error),
      });
    }
  },
  refreshSession: async () => {
    const token = get().sessionToken;

    if (!token) {
      clearAuthState(set, { isLoading: false });
      return;
    }

    try {
      const session = await getSession(token);

      if (!session.session || !session.user) {
        await clearStoredSession();
        clearAuthState(set, { isLoading: false });
        return;
      }

      set({
        sessionToken: token,
        user: session.user,
        isAuthenticated: true,
        isLoading: false,
        statusMessage: null,
      });
    } catch (error) {
      await clearStoredSession();
      clearAuthState(set, {
        isLoading: false,
        statusMessage: readErrorMessage(error),
      });
    }
  },
  signInWithApple: async () => {
    if (Platform.OS !== "ios") {
      throw new Error("Apple sign-in is available on iOS only.");
    }

    const isAvailable = await AppleAuthentication.isAvailableAsync();

    if (!isAvailable) {
      throw new Error("Apple sign-in is not available on this device.");
    }

    set({ isWorking: true, statusMessage: "Opening Apple sign-in…" });

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Apple did not return an identity token.");
      }

      const result = await signInWithSocialToken({
        provider: "apple",
        sessionToken: get().sessionToken,
        idToken: {
          token: credential.identityToken,
          user: {
            email: credential.email,
            name: credential.fullName,
          },
        },
      });

      await persistSignedInSession(result.token, result.user);
      set({
        isWorking: false,
        statusMessage: null,
        sessionToken: result.token,
        user: result.user,
        isAuthenticated: true,
      });
    } catch (error) {
      set({ isWorking: false, statusMessage: readProviderError(error) });
      throw error;
    }
  },
  signInWithGoogle: async () => {
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

    if (!iosClientId) {
      throw new Error(
        "Google sign-in is not configured. Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.",
      );
    }

    set({ isWorking: true, statusMessage: "Opening Google sign-in…" });

    try {
      const { GoogleSignin } = await loadGoogleSignInModule();

      configureGoogle(GoogleSignin, iosClientId);

      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      const signInResult = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken ?? readGoogleIdToken(signInResult);

      if (!idToken) {
        throw new Error("Google did not return an identity token.");
      }

      const result = await signInWithSocialToken({
        provider: "google",
        sessionToken: get().sessionToken,
        idToken: {
          token: idToken,
          accessToken: tokens.accessToken,
        },
      });

      await persistSignedInSession(result.token, result.user);
      set({
        isWorking: false,
        statusMessage: null,
        sessionToken: result.token,
        user: result.user,
        isAuthenticated: true,
      });
    } catch (error) {
      set({ isWorking: false, statusMessage: readProviderError(error) });
      throw error;
    }
  },
  sendEmailOtp: async (email: string) => {
    set({ isWorking: true, statusMessage: "Sending code…" });

    try {
      await sendEmailOtpRequest({ email, sessionToken: get().sessionToken });
      set({ isWorking: false, statusMessage: "Code sent. Check your email." });
    } catch (error) {
      set({ isWorking: false, statusMessage: readErrorMessage(error) });
      throw error;
    }
  },
  signInWithEmailOtp: async (email: string, otp: string) => {
    set({ isWorking: true, statusMessage: "Verifying code…" });

    try {
      const result = await signInWithEmailOtpRequest({
        email,
        otp,
        sessionToken: get().sessionToken,
      });

      await persistSignedInSession(result.token, result.user);
      set({
        isWorking: false,
        statusMessage: null,
        sessionToken: result.token,
        user: result.user,
        isAuthenticated: true,
      });
    } catch (error) {
      set({ isWorking: false, statusMessage: readErrorMessage(error) });
      throw error;
    }
  },
  signOut: async () => {
    const token = get().sessionToken;
    set({ isWorking: true, statusMessage: "Signing out…" });

    try {
      await signOutRequest(token);
    } catch {
      // Local session cleanup is more important than blocking on best-effort server sign-out.
    } finally {
      await clearStoredSession();
      clearAuthState(set, { isLoading: false });
    }
  },
}));

async function loadGoogleSignInModule(): Promise<GoogleSignInModule> {
  try {
    return await import("@react-native-google-signin/google-signin");
  } catch (error) {
    throw new Error(
      "Google sign-in is not available in this native build. Rebuild the iOS dev client after installing @react-native-google-signin/google-signin.",
      { cause: error },
    );
  }
}

function configureGoogle(
  GoogleSignin: GoogleSignInModule["GoogleSignin"],
  iosClientId: string,
) {
  if (googleConfiguredClientId === iosClientId) {
    return;
  }

  GoogleSignin.configure({ iosClientId });
  googleConfiguredClientId = iosClientId;
}

async function persistSignedInSession(token: string, user: AuthUser | null) {
  if (!user) {
    throw new Error("Sign in succeeded, but the server did not return a user.");
  }

  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

async function clearStoredSession() {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}

function clearAuthState(
  set: (state: Partial<AuthSessionState>) => void,
  extra: Partial<AuthSessionState> = {},
) {
  set({
    sessionToken: null,
    user: null,
    isAuthenticated: false,
    isWorking: false,
    statusMessage: null,
    ...extra,
  });
}

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function readProviderError(error: unknown) {
  const code = readErrorCode(error);

  if (code === "SIGN_IN_CANCELLED" || code === "12501") {
    return "Sign-in cancelled.";
  }

  if (code === "IN_PROGRESS") {
    return "Sign-in is already in progress.";
  }

  if (code === "PLAY_SERVICES_NOT_AVAILABLE") {
    return "Google Play Services are not available.";
  }

  return readErrorMessage(error);
}

function readErrorCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return null;
  }

  const code = (error as { code?: unknown }).code;

  return typeof code === "string" ? code : null;
}

function readGoogleIdToken(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const data = record.data as Record<string, unknown> | undefined;
  const idToken = record.idToken ?? data?.idToken;

  return typeof idToken === "string" ? idToken : null;
}
