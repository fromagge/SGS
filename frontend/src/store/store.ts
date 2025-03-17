import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import contactReducer, { contactsApi } from './contactSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactReducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(contactsApi.middleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
