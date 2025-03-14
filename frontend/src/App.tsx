import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/store';
import { AppDispatch } from '@store/store';
import { checkTokenAsync, getUserAsync } from '@store/authSlice';

import Login from '@pages/Login';
import NotFound from '@pages/NotFound';
import AccessToken from '@pages/AccessToken';
import Dashboard from '@pages/Dashboard';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(getUserAsync());
      dispatch(checkTokenAsync());
    }
  }, [isLoggedIn, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          // Public routes
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/access-token" element={<AccessToken />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
