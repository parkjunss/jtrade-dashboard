import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'qortrade-auth-session';

const demoUser = {
  name: 'Jun Portfolio',
  username: 'jvinstock',
  email: 'jvinstock@trade.app',
  role: 'Portfolio Manager',
};

const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredSession()?.user ?? null);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [user]);

  const value = useMemo(() => ({
    isAuthenticated: Boolean(user),
    user,
    signIn: ({ email, name } = {}) => {
      setUser({
        ...demoUser,
        name: name?.trim() || demoUser.name,
        email: email?.trim() || demoUser.email,
      });
    },
    signUp: ({ email, name } = {}) => {
      setUser({
        ...demoUser,
        name: name?.trim() || demoUser.name,
        email: email?.trim() || demoUser.email,
      });
    },
    signOut: () => setUser(null),
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
