import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { loadUser } from '../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    void dispatch(loadUser());
  }, [dispatch]);

  return <NavigationContainer>{isAuthenticated ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
};
