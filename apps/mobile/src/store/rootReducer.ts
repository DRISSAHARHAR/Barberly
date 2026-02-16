import { combineReducers } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import booking from './slices/bookingSlice';
import notification from './slices/notificationSlice';
import user from './slices/userSlice';

export const rootReducer = combineReducers({ auth, user, booking, notification });
