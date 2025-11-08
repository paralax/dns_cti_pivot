import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

function LoginPage({ onLoginSuccess, onLoginError }) {
  return (
    <div className="login-page">
      <h2>Welcome to the CTI DNS Investigator</h2>
      <p>Please log in with your Google account to continue.</p>
      <GoogleLogin
        onSuccess={onLoginSuccess}
        onError={onLoginError}
      />
    </div>
  );
}

export default LoginPage;
