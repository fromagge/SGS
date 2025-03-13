import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
}

// Load auth state from local storage
const loadAuthState = (): AuthState => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return {
        isLoggedIn: false,
        token: null,
        refreshToken: null,
        expiresIn: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading auth state:', err);
    return {
      isLoggedIn: false,
      token: null,
      refreshToken: null,
      expiresIn: null,
    };
  }
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; refresh_token: string; expires_in: number }>) => {
        console.log("Mondacion")
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refresh_token;
      state.expiresIn = action.payload.expires_in;
      saveAuthState(state);
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.refreshToken = null;
      state.expiresIn = null;
      saveAuthState(state);
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;