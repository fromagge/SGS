/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

import User from 'types/user';

interface AuthState {
  userData: User | null;
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
}

const defaultState: AuthState = {
  userData: null,
  isLoggedIn: false,
  token: null,
  refreshToken: null,
  expiresIn: null,
};

// Cookie configuration
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production', // Use secure in production
  sameSite: 'strict' as const,
  path: '/',
};

export const TOKEN_COOKIE_NAME = 'auth_token';
export const REFRESH_TOKEN_COOKIE_NAME = 'auth_refresh_token';
export const EXPIRES_IN_COOKIE_NAME = 'auth_expires_in';

// Load auth state from cookies
const loadAuthState = (): AuthState => {
  try {
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
    const expiresIn = Cookies.get(EXPIRES_IN_COOKIE_NAME);
    const isLoggedIn = refreshToken !== null && refreshToken !== undefined;

    return {
      token: token || null,
      refreshToken: refreshToken || null,
      expiresIn: expiresIn ? Number(expiresIn) : null,
      userData: null,
      isLoggedIn,
    };
  } catch (error) {
    console.log('Error loading auth state', error);
    return defaultState;
  }
};

const eraseAuthState = () => {
  Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
  Cookies.remove(EXPIRES_IN_COOKIE_NAME, { path: '/' });
  localStorage.removeItem('authState');
};

const isTokenExpired = (
  token: string | null,
  expiresIn: number | null,
): boolean => {
  if (token === null) return true;
  if (expiresIn === null) return true;
  return Date.now() > expiresIn;
};

// Save auth state to cookies
const saveAuthState = (state: AuthState) => {
  try {
    const expiryDate = state.expiresIn ? new Date(state.expiresIn) : undefined;

    if (state.token) {
      Cookies.set(TOKEN_COOKIE_NAME, state.token, {
        ...COOKIE_OPTIONS,
        expires: expiryDate,
      });
    }
    if (state.refreshToken) {
      Cookies.set(REFRESH_TOKEN_COOKIE_NAME, state.refreshToken, {
        ...COOKIE_OPTIONS,
      });
    }
    if (state.expiresIn) {
      Cookies.set(EXPIRES_IN_COOKIE_NAME, state.expiresIn.toString(), {
        ...COOKIE_OPTIONS,
      });
    }
  } catch (err) {
    console.error('Error saving auth state to cookies:', err);
  }
};

export const checkTokenAsync = createAsyncThunk(
  'auth/checkToken',
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: AuthState };
    if (state.auth.isLoggedIn) {
      if (isTokenExpired(state.auth.token, state.auth.expiresIn)) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken: state.auth.refreshToken,
          });

          dispatch(refresh(response.data));
        } catch (_) {
          dispatch(logout());
        }
      }
    }
  },
);

export const getUserAsync = createAsyncThunk(
  'auth/getUser',
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: AuthState };
    if (state.auth.isLoggedIn) {
      if (state.auth.userData) {
        return state.auth.userData;
      }
      if (state.auth.token && state.auth.isLoggedIn) {
        try {
          const { data } = await axios.get('/api/user/self', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${state.auth.token}`,
            },
          });

          return dispatch(setUser(data));
        } catch (_) {
          return dispatch(logout());
        }
      }
    }
  },
);

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    refresh: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
      }>,
    ) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiresIn = Date.now() + Number(action.payload.expiresIn) * 1000;
      state.isLoggedIn = true;
      saveAuthState(state);
    },
    login: (
      state,
      action: PayloadAction<{
        userData: User | null;
        token: string | null;
        refreshToken: string | null;
        expiresIn: string;
      }>,
    ) => {
      state.isLoggedIn = true;
      state.userData = action.payload.userData;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.expiresIn = Date.now() + Number(action.payload.expiresIn) * 1000;
      saveAuthState(state);
    },
    logout: (state) => {
      state.userData = null;
      state.isLoggedIn = false;
      state.token = null;
      state.refreshToken = null;
      state.expiresIn = null;

      eraseAuthState();
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.userData = action.payload;
      saveAuthState(state);
    },
  },
});

export const { login, logout, refresh, setUser } = authSlice.actions;
export default authSlice.reducer;
