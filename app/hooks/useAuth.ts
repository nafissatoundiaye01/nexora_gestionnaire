'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../types';

const TOKEN_KEY = 'nexora_token';
const REFRESH_TOKEN_KEY = 'nexora_refresh_token';
const USER_KEY = 'nexora_user';
const EXPIRES_AT_KEY = 'nexora_expires_at';

interface AuthState {
  user: Omit<User, 'password'> | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef<boolean>(false);

  // Save auth data to localStorage
  const saveToStorage = useCallback((data: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    localStorage.setItem(EXPIRES_AT_KEY, data.expiresAt);
  }, []);

  // Clear auth data from localStorage
  const clearStorage = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  }, []);

  // Force logout - only called after refresh fails
  const forceLogout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    clearStorage();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, [clearStorage]);

  // Refresh access token
  const refreshAccessToken = useCallback(async (refreshToken: string): Promise<boolean> => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshingRef.current) {
      return false;
    }

    isRefreshingRef.current = true;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        throw new Error('Refresh failed');
      }

      const data: AuthResponse = await res.json();
      saveToStorage(data);
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Schedule next refresh
      const expiresTime = new Date(data.expiresAt).getTime();
      const now = Date.now();
      const refreshTime = expiresTime - now - (2 * 60 * 1000); // 2 minutes before expiration

      if (refreshTime > 0 && refreshTimeoutRef.current === null) {
        refreshTimeoutRef.current = setTimeout(async () => {
          refreshTimeoutRef.current = null;
          const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
          if (rt) {
            const success = await refreshAccessToken(rt);
            if (!success) {
              forceLogout();
            }
          }
        }, refreshTime);
      }

      isRefreshingRef.current = false;
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      isRefreshingRef.current = false;
      return false;
    }
  }, [saveToStorage, forceLogout]);

  // Try to refresh token before any logout
  const tryRefreshBeforeLogout = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      console.log('Attempting token refresh before logout...');
      const success = await refreshAccessToken(refreshToken);
      if (success) {
        console.log('Token refresh successful, staying logged in');
        return true;
      }
      console.log('Token refresh failed, proceeding with logout');
    }
    return false;
  }, [refreshAccessToken]);

  // Schedule token refresh
  const scheduleRefresh = useCallback((expiresAt: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    const expiresTime = new Date(expiresAt).getTime();
    const now = Date.now();
    // Refresh 2 minutes before expiration
    const refreshTime = expiresTime - now - (2 * 60 * 1000);

    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        refreshTimeoutRef.current = null;
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const success = await refreshAccessToken(refreshToken);
          if (!success) {
            forceLogout();
          }
        }
      }, refreshTime);
    } else {
      // Token is about to expire or already expired, try refresh immediately
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        refreshAccessToken(refreshToken).then(success => {
          if (!success) {
            forceLogout();
          }
        });
      }
    }
  }, [refreshAccessToken, forceLogout]);

  // Validate current token
  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        // Token invalid or expired, try to refresh
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          console.log('Token validation failed, attempting refresh...');
          return await refreshAccessToken(refreshToken);
        }
        return false;
      }

      const data = await res.json();
      setAuthState({
        user: data.user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      if (data.expiresAt) {
        scheduleRefresh(data.expiresAt);
      }

      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      // Try refresh on any error
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        return await refreshAccessToken(refreshToken);
      }
      return false;
    }
  }, [refreshAccessToken, scheduleRefresh]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (token && userStr) {
        // Check if token is expired
        if (expiresAt && new Date(expiresAt) < new Date()) {
          // Token expired, try to refresh first
          if (refreshToken) {
            console.log('Token expired, attempting refresh...');
            const success = await refreshAccessToken(refreshToken);
            if (!success) {
              forceLogout();
            }
          } else {
            forceLogout();
          }
        } else {
          // Validate token with server
          const isValid = await validateToken(token);
          if (!isValid) {
            // validateToken already tried refresh, so logout
            forceLogout();
          }
        }
      } else if (refreshToken) {
        // No token but have refresh token, try to refresh
        console.log('No token but refresh token exists, attempting refresh...');
        const success = await refreshAccessToken(refreshToken);
        if (!success) {
          forceLogout();
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [validateToken, refreshAccessToken, forceLogout]);

  // Login
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Erreur de connexion' };
      }

      saveToStorage(data);
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      scheduleRefresh(data.expiresAt);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }, [saveToStorage, scheduleRefresh]);

  // Register
  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        return { success: false, error: responseData.error || 'Erreur d\'inscription' };
      }

      saveToStorage(responseData);
      setAuthState({
        user: responseData.user,
        token: responseData.token,
        isAuthenticated: true,
        isLoading: false,
      });
      scheduleRefresh(responseData.expiresAt);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Erreur d\'inscription' };
    }
  }, [saveToStorage, scheduleRefresh]);

  // Logout - tries refresh first, only logs out if refresh fails
  const logout = useCallback(async (force: boolean = false) => {
    // If not forced, try to refresh first
    if (!force) {
      const refreshed = await tryRefreshBeforeLogout();
      if (refreshed) {
        // Refresh successful, don't logout
        return;
      }
    }

    // Proceed with logout
    const token = localStorage.getItem(TOKEN_KEY);

    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      forceLogout();
    }
  }, [tryRefreshBeforeLogout, forceLogout]);

  // Get auth header for API requests
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  // Change password
  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        // Try refresh before failing
        const refreshed = await tryRefreshBeforeLogout();
        if (!refreshed) {
          return { success: false, error: 'Non authentifie' };
        }
      }

      const currentToken = localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If unauthorized, try refresh
        if (res.status === 401) {
          const refreshed = await tryRefreshBeforeLogout();
          if (refreshed) {
            // Retry with new token
            return changePassword(currentPassword, newPassword);
          }
        }
        return { success: false, error: data.error || 'Erreur lors du changement de mot de passe' };
      }

      // Update user in state and localStorage
      setAuthState(prev => ({
        ...prev,
        user: data.user,
      }));
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Erreur lors du changement de mot de passe' };
    }
  }, [tryRefreshBeforeLogout]);

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    mustChangePassword: authState.user?.mustChangePassword ?? false,
    login,
    register,
    logout,
    getAuthHeader,
    changePassword,
    tryRefreshBeforeLogout,
  };
}
