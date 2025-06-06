import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useBudgetStore } from '../store';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const setUser = useBudgetStore((state) => state.setUser);

  const handleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser({
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture
    });
  };

  const handleError = () => {
    console.error('Erreur de connexion');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: '#1e293b',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#e2e8f0', marginBottom: '1.5rem' }}>
          Budget Manager
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
          Connectez-vous pour accéder à votre gestionnaire de budget
        </p>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
          theme="filled_blue"
          text="signin_with"
          shape="rectangular"
        />
      </div>
    </div>
  );
};

export default Login; 