// ── NexusFlow Auth Context (AWS Cognito + Google Identity Services) ──

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  signInWithRedirect,
  getCurrentUser,
  fetchUserAttributes,
} from "aws-amplify/auth";
import { isCognitoConfigured } from "../utils/authConfig";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}

// Decode JWT payload (Google ID token is a standard JWT)
function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isCognitoConfigured);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  // Check existing session on mount
  useEffect(() => {
    // Check local user first (for both Google and email sign-ins)
    const localUser = localStorage.getItem("nexusflow_local_user");
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        setUser(parsed);
        setUserId(parsed.userId);
        setIsLoading(false);
        return;
      } catch {
        // ignore
      }
    }

    if (isConfigured) {
      checkSession();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured]);

  const checkSession = async () => {
    try {
      const currentUser = await getCurrentUser();
      const attrs = await fetchUserAttributes();
      const u = {
        userId: currentUser.userId,
        email: attrs.email || "",
        name: attrs.name || attrs.email || "",
      };
      setUser(u);
      setUserId(currentUser.userId);
    } catch {
      setUser(null);
      setUserId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Sign In (Email + Password) ──
  const signIn = useCallback(
    async (email, password) => {
      if (!isConfigured) {
        const localId = "local_" + email.replace(/[^a-zA-Z0-9]/g, "_");
        const u = { userId: localId, email, name: email.split("@")[0] };
        localStorage.setItem("nexusflow_local_user", JSON.stringify(u));
        setUser(u);
        setUserId(localId);
        return { isSignedIn: true };
      }

      const result = await amplifySignIn({ username: email, password });
      if (result.isSignedIn) {
        await checkSession();
      }
      return result;
    },
    [isConfigured],
  );

  // ── Sign Up (Email + Password) ──
  const signUp = useCallback(
    async (email, password, name) => {
      if (!isConfigured) {
        const localId = "local_" + email.replace(/[^a-zA-Z0-9]/g, "_");
        const u = {
          userId: localId,
          email,
          name: name || email.split("@")[0],
        };
        localStorage.setItem("nexusflow_local_user", JSON.stringify(u));
        setUser(u);
        setUserId(localId);
        return { isSignUpComplete: true, userId: localId };
      }

      const result = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: { email, name: name || email.split("@")[0] },
        },
      });
      return result;
    },
    [isConfigured],
  );

  // ── Confirm Sign Up ──
  const confirmSignUp = useCallback(
    async (email, code) => {
      if (!isConfigured) return { isSignUpComplete: true };

      const result = await amplifyConfirmSignUp({
        username: email,
        confirmationCode: code,
      });
      return result;
    },
    [isConfigured],
  );

  // ── Google Sign-In (using Google OAuth2 Token Client) ──
  // Keep a ref to the token client so we initialize it only once
  const googleTokenClientRef = useRef(null);
  const googlePromiseRef = useRef(null);

  const signInWithGoogle = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!googleClientId) {
        reject(
          new Error(
            "Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.",
          ),
        );
        return;
      }

      // Store resolve/reject so the callback & error_callback can use them
      googlePromiseRef.current = { resolve, reject };

      // Wait for GSI script to load (retry up to 3 seconds)
      let attempts = 0;
      const maxAttempts = 6;
      const tryInit = () => {
        if (window.google?.accounts?.oauth2) {
          // Initialize token client only once, reuse on subsequent calls
          if (!googleTokenClientRef.current) {
            googleTokenClientRef.current =
              window.google.accounts.oauth2.initTokenClient({
                client_id: googleClientId,
                scope: "email profile",
                callback: async (tokenResponse) => {
                  const promiseHandlers = googlePromiseRef.current;
                  if (!promiseHandlers) return;
                  googlePromiseRef.current = null;

                  if (tokenResponse.error) {
                    promiseHandlers.reject(new Error(tokenResponse.error));
                    return;
                  }

                  try {
                    const res = await fetch(
                      "https://www.googleapis.com/oauth2/v3/userinfo",
                      {
                        headers: {
                          Authorization: `Bearer ${tokenResponse.access_token}`,
                        },
                      },
                    );
                    const info = await res.json();

                    const googleUser = {
                      userId: "google_" + info.sub,
                      email: info.email,
                      name: info.name || info.email.split("@")[0],
                      picture: info.picture || "",
                      provider: "google",
                    };

                    localStorage.setItem(
                      "nexusflow_local_user",
                      JSON.stringify(googleUser),
                    );
                    setUser(googleUser);
                    setUserId(googleUser.userId);
                    promiseHandlers.resolve(googleUser);
                  } catch (err) {
                    promiseHandlers.reject(
                      new Error(
                        "Failed to fetch Google profile: " + err.message,
                      ),
                    );
                  }
                },
                // Called when the user closes the popup or denies consent
                error_callback: (errorResponse) => {
                  const promiseHandlers = googlePromiseRef.current;
                  if (!promiseHandlers) return;
                  googlePromiseRef.current = null;

                  // "popup_closed" or "popup_failed_to_open" — not a real error,
                  // just user cancelled. Reject with a gentle message.
                  const type = errorResponse?.type || "unknown";
                  if (type === "popup_closed") {
                    promiseHandlers.reject(new Error("__popup_closed__"));
                  } else {
                    promiseHandlers.reject(
                      new Error(`Google sign-in error: ${type}`),
                    );
                  }
                },
              });
          }

          // Request the access token (opens popup)
          googleTokenClientRef.current.requestAccessToken();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(tryInit, 500);
        } else {
          googlePromiseRef.current = null;
          reject(
            new Error(
              "Google Sign-In failed to load. Please refresh the page and try again.",
            ),
          );
        }
      };

      tryInit();
    });
  }, [googleClientId]);

  // ── Sign Out ──
  const signOut = useCallback(async () => {
    localStorage.removeItem("nexusflow_local_user");

    if (isConfigured) {
      try {
        await amplifySignOut();
      } catch {
        // ignore
      }
    }

    // Revoke Google session if available
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }

    setUser(null);
    setUserId(null);
  }, [isConfigured]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        isLoading,
        isConfigured,
        signIn,
        signUp,
        confirmSignUp,
        signOut,
        signInWithGoogle,
        hasGoogleClientId: !!googleClientId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
