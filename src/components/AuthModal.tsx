import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types/decision';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await api.register(email, password, name);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Registration failed');
        }
      } else {
        const res = await api.login(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B0C]/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#090B0C] border border-white/10 p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#8E959E] hover:text-[#F5F5F2] hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#B9E5F3]"></span>
          <span className="text-xs font-mono tracking-widest text-[#B9E5F3] uppercase">
            FEZI Security & Ownership
          </span>
        </div>

        <h3 className="text-2xl font-serif text-[#F5F5F2] mb-1 font-normal">
          {mode === 'login' ? 'Sign In to FEZI' : 'Create Decision Account'}
        </h3>
        <p className="text-xs text-[#8E959E] mb-6">
          {mode === 'login'
            ? 'Access your private decision dossiers and sensitivity simulations.'
            : 'Every decision you evaluate is strictly private and owned by your account.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-[#8E959E] mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-[#8E959E]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1214] border border-white/10 text-xs text-[#F5F5F2] placeholder-[#8E959E]/50 focus:outline-none focus:border-[#B9E5F3]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-[#8E959E] mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#8E959E]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1214] border border-white/10 text-xs text-[#F5F5F2] placeholder-[#8E959E]/50 focus:outline-none focus:border-[#B9E5F3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#8E959E] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#8E959E]" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F1214] border border-white/10 text-xs text-[#F5F5F2] placeholder-[#8E959E]/50 focus:outline-none focus:border-[#B9E5F3]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#B9E5F3] hover:bg-[#a6dcf0] text-[#090B0C] font-semibold text-xs transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-[#090B0C] border-t-transparent rounded-full" />
            ) : mode === 'login' ? (
              <span>Sign In</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-[#8E959E]">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-[#B9E5F3] hover:underline font-mono"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[#B9E5F3] hover:underline font-mono"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
