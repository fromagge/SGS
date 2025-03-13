import User from '../types/user';
import axios from 'axios';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

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

// Load auth state from local storage
const loadAuthState = (): AuthState => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return defaultState;
    }
    return JSON.parse(serializedState);
  } catch {
    return defaultState;
  }
};

const eraseAuthState = () => {
  localStorage.removeItem('authState');
};

const isTokenExpired = (expiresIn: number | null): boolean => {
  if (expiresIn === null) return true;
  return Date.now() > expiresIn;
};

// Save auth state to local storage
const saveAuthState = (state: AuthState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('authState', serializedState);
  } catch (err) {
    console.error('Error saving auth state:', err);
  }
};

const initialState: AuthState = loadAuthState();

export const checkTokenAsync = createAsyncThunk(
  'auth/checkToken',
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: AuthState };
    if (state.auth.isLoggedIn) {
      if (isTokenExpired(state.auth.expiresIn)) {
        try {
          const response = await axios.get('/api/auth/user', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${state.auth.token}`,
            },
          });
        } catch (error) {
          console.error('Error refreshing token:', error);
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
          const { data, status } = await axios.get('/api/user/self', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${state.auth.token}`,
            },
          });
          if (status === 200) {
            return dispatch(setUser(data));
          }
        } catch (_) {
          return dispatch(logout());
        }
      }
      dispatch(logout());
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        userData: User | null;
        token: string | null;
        refreshToken: string | null;
        expiresIn: number;
      }>,
    ) => {
      state.isLoggedIn = true;
      state.userData = action.payload.userData;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.expiresIn = Date.now() + action.payload.expiresIn * 1000;
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
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
