import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { fetchUserProfile } from '../redux/features/auth/authSlice';
import { getCart } from '../redux/features/cart/cartSlice';
import { fetchCategories } from '../redux/features/categories/categoriesSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user: userInfo, token } = useSelector((state) => state.auth);
  const { id: cartId, user_id: cartUserId } = useSelector((state) => state.cart);

  useEffect(() => {
    // This effect runs once on app load to fetch categories
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // This effect handles the initial authentication and cart logic
    const tokenInStorage = localStorage.getItem('token');
    if (tokenInStorage) {
      if (!userInfo) {
        dispatch(fetchUserProfile())
          .unwrap()
          .then((fetchedUser) => {
            if (fetchedUser && fetchedUser.id) {
              dispatch(getCart({ userId: fetchedUser.id }));
            }
          })
          .catch((error) => {
            console.error('Auth token is invalid, fetching guest cart:', error);
            let sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
              sessionId = uuidv4();
              localStorage.setItem('sessionId', sessionId);
            }
            dispatch(getCart({ sessionId }));
          });
      } else if (userInfo && userInfo.id) {
        if (!cartId || cartUserId !== userInfo.id) {
          dispatch(getCart({ userId: userInfo.id }));
        }
      }
    } else {
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem('sessionId', sessionId);
      }
      if (!cartId) {
        dispatch(getCart({ sessionId }));
      }
    }
    // We remove 'status' from the dependency array to prevent this from re-running
  }, [dispatch, token, userInfo, cartId, cartUserId]);

  return children;
};

export default AuthProvider;