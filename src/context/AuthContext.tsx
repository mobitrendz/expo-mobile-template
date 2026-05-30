import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { setAccessToken } from '../api/client';
import {
  getCurrentUserApiV1LoginCurrentUserGet,
  loginAccessTokenApiV1LoginAccessTokenPost,
  registerUserApiV1LoginSignupPost,
  type UserPublic,
} from '../client';
import { getApiErrorMessage } from '../lib/api-error';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from '../lib/auth-storage';

type AuthContextValue = {
  user: UserPublic | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_ROLE = 'user' as const;

async function fetchCurrentUser(): Promise<UserPublic> {
  const { data, error } = await getCurrentUserApiV1LoginCurrentUserGet();
  if (error || !data) {
    throw error ?? new Error('Unable to load current user');
  }
  return data;
}

function assertUserRole(user: UserPublic) {
  if (user.role !== USER_ROLE) {
    throw new Error(
      'This app is for regular users only. Admin and super user accounts cannot sign in here.',
    );
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback(async (token: string | null) => {
    if (!token) {
      setAccessToken(undefined);
      setUser(null);
      return;
    }

    setAccessToken(token);
    const currentUser = await fetchCurrentUser();
    assertUserRole(currentUser);
    setUser(currentUser);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    assertUserRole(currentUser);
    setUser(currentUser);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await getStoredAccessToken();
        if (token && !cancelled) {
          await applySession(token);
        }
      } catch {
        await clearStoredAccessToken();
        setAccessToken(undefined);
        setUser(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await loginAccessTokenApiV1LoginAccessTokenPost({
        body: {
          username: email.trim(),
          password,
        },
      });

      if (error || !data?.access_token) {
        throw new Error(getApiErrorMessage(error, 'Invalid email or password'));
      }

      await setStoredAccessToken(data.access_token);

      try {
        await applySession(data.access_token);
      } catch (roleError) {
        await clearStoredAccessToken();
        setAccessToken(undefined);
        setUser(null);
        throw roleError;
      }
    },
    [applySession],
  );

  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { data, error } = await registerUserApiV1LoginSignupPost({
        body: {
          email: email.trim(),
          password,
          full_name: fullName.trim() || null,
        },
      });

      if (error || !data) {
        throw new Error(getApiErrorMessage(error, 'Could not create account'));
      }

      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    await clearStoredAccessToken();
    setAccessToken(undefined);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout, refreshUser }),
    [user, isLoading, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
