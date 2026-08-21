import React from 'react';
import { Outlet } from 'react-router-dom';

// Auth pages get no header/sidebar — full screen clean layout
const AuthLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
