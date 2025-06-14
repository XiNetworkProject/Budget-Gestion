import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useStore } from '../store';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const { setUser, setToken } = useStore();

  const handleSuccess = (credentialResponse) => {
    const token = credentialResponse.credential;
    const decoded = jwtDecode(token);
    setToken(token);
    setUser({
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture
    });
  };

  const handleError = () => {
    console.error('Login Failed');
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Budget Gestion</h1>
      <div className="login-container">
        <h2 className="text-lg text-white">Connectez-vous pour démarrer</h2>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
      </div>
      <span className="login-watermark">XimaMDev - 2025</span>
    </div>
  );
};

export default Login; 