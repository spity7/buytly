"use client";

import { buytlyApi } from "@/api/generated";
import {
  notifyAuthenticatedAuthAttempt,
  setOnAuthFailure,
  setOnAuthenticatedAuthAttempt,
} from "@/lib/auth/authCallbacks";
import { AUTHENTICATED_HOME } from "@/lib/auth/constants";
import { getApiError } from "@/lib/auth/getApiError";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  hasStoredTokens,
  persistTokens,
} from "@/lib/auth/tokens";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return null;
    }

    try {
      const response = await buytlyApi.getCurrentUser();
      setUser(response.data ?? null);
      return response.data ?? null;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!hasStoredTokens()) {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      await hydrateUser();
      if (!cancelled) {
        setIsLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [hydrateUser]);

  useEffect(() => {
    setOnAuthFailure(() => {
      setUser(null);
      router.replace("/?auth=signin");
    });

    setOnAuthenticatedAuthAttempt(() => {
      router.replace(AUTHENTICATED_HOME);
    });
  }, [router]);

  const handleAuthSuccess = useCallback(
    async (data) => {
      persistTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      const hydratedUser = await hydrateUser();
      return hydratedUser ?? data.user ?? null;
    },
    [hydrateUser],
  );

  const login = useCallback(
    async ({ email, password }) => {
      const response = await buytlyApi.loginUser({ email, password });
      return handleAuthSuccess(response.data);
    },
    [handleAuthSuccess],
  );

  const register = useCallback(
    async (payload) => {
      const response = await buytlyApi.registerUser(payload);
      return handleAuthSuccess(response.data);
    },
    [handleAuthSuccess],
  );

  const loginWithGoogle = useCallback(
    async ({ idToken, role }) => {
      const response = await buytlyApi.googleAuth({
        idToken,
        ...(role ? { role } : {}),
      });
      return handleAuthSuccess(response.data);
    },
    [handleAuthSuccess],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await buytlyApi.logoutUser({ refreshToken });
      }
    } catch {
      // Best-effort server logout; always clear local session.
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      loginWithGoogle,
      logout,
      refreshUser: hydrateUser,
    }),
    [user, isLoading, login, register, loginWithGoogle, logout, hydrateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useAuthSafe() {
  return useContext(AuthContext);
}

export { getApiError };
