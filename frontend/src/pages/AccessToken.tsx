import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '@store/authSlice';
import { useNavigate } from 'react-router-dom';

const AccessToken = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refresh_token') ?? '';
    const expiresIn = params.get('expires_in') ?? 0;
    console.log("Monda verga picha culo")
    if (token && expiresIn) {
      dispatch(
        login({
          token,
          refresh_token: refreshToken,
          expires_in: Number(expiresIn),
        }),
      );
      navigate('/');
    }
  }, [dispatch, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 animate-spin"></div>
    </div>
  );
};

export default AccessToken;
