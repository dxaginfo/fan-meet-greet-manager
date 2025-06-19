import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';
import fanReducer from './slices/fanSlice';
import registrationReducer from './slices/registrationSlice';
import notificationReducer from './slices/notificationSlice';
import checkInReducer from './slices/checkInSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    fans: fanReducer,
    registrations: registrationReducer,
    notifications: notificationReducer,
    checkIn: checkInReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;