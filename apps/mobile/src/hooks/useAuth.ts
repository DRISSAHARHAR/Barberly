import { useEffect } from 'react';
import { loadUser, login, logout, register, verifyOTP } from '../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../store';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return {
    ...auth,
    register: (payload: Parameters<typeof register>[0]) => dispatch(register(payload)),
    verifyOTP: (payload: Parameters<typeof verifyOTP>[0]) => dispatch(verifyOTP(payload)),
    login: (payload: Parameters<typeof login>[0]) => dispatch(login(payload)),
    logout: () => dispatch(logout())
  };
};
