import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProfile } from '../store/slices/userSlice';

export const useUser = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!user.profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user.profile]);

  return {
    ...user,
    refreshProfile: () => dispatch(fetchProfile())
  };
};
