import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-gradient-to-br from-sarbloh-red via-sarbloh-red to-sarbloh-red-dark">
        {/* Soft decorative shapes */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute bottom-10 -right-16 w-80 h-80 rounded-full bg-sarbloh-green/20" />
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 mb-10">
            <img
              src="/sarbloh-logo.jpg"
              alt="Sarbloh Ayurvedic Clinic"
              className="h-16 w-auto object-contain"
            />
          </div>

          <h2 className="text-white text-2xl font-semibold tracking-tight">
            Ayurvedic Clinic 
          </h2>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="/sarbloh-logo.jpg"
              alt="Sarbloh"
              className="h-14 w-auto object-contain mx-auto"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
              <p className="text-sm text-gray-500 mt-1.5">
                Sign in to continue to Sarbloh
              </p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sarbloh-green focus:border-transparent transition"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sarbloh-green focus:border-transparent transition"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-sarbloh-red text-white font-medium rounded-xl hover:bg-sarbloh-red-dark shadow-sm transition-colors disabled:opacity-60 text-sm"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Sarbloh Ayurvedic Clinic
          </p>
        </div>
      </div>
    </div>
  );
}