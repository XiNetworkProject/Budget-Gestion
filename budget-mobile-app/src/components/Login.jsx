import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import useStore from '../store';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const { setUser } = useStore();

  const handleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Connexion à Budget Gestion
        </h1>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
      </div>
    </div>
  );
};

export default Login; 