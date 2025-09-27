import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUserProfile } from '../redux/features/auth/authSlice';

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchUserProfile())
        .unwrap()
        .catch((error) => {
          console.error('Authentication failed:', error);
          localStorage.removeItem('token');
        });
    }
  }, [dispatch]);

  return children;
};