/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { auth0 } from '@/lib/auth0';

export default function Login() {
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await auth0.loginWithRedirect({
        authorizationParams: {
          connection: 'google-oauth2',
          redirect_uri: `${window.location.origin}/protected/home`
        }
      });
    } catch (error) {
      console.error(error);
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sign in with Google
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
} 