import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import menuCategoryReducer from './slices/menuCategorySlice';
import menuItemReducer from './slices/menuItemSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    menuCategories: menuCategoryReducer,
    menuItems: menuItemReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
