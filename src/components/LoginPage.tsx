// d:\Project\TVK Admin\src\components\LoginPage.tsx
import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setError('Username மற்றும் Password இரண்டையும் உள்ளிடவும்.');
      return;
    }

    setIsLoading(true);

    // Short simulated authentication delay for smooth UX
    setTimeout(() => {
      if (trimmedUser === 'admin' && trimmedPass === 'vickyharsha@123') {
        localStorage.setItem('tvk_admin_authenticated', 'true');
        localStorage.setItem('tvk_admin_user', trimmedUser);
        localStorage.setItem('tvk_admin_login_time', new Date().toISOString());
        onLoginSuccess(trimmedUser);
      } else {
        setError('தவறான Username அல்லது Password! சரியான தகவலை உள்ளிடவும்.');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 sm:p-10 text-white z-10">
        {/* Brand / Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-yellow-500 to-red-700 p-0.5 shadow-lg shadow-red-900/40 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
              TVK
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            MANAVAI TVK
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
              ADMIN
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Grievance & Ward Command Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                autoFocus
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition duration-150"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-900/30 hover:shadow-red-900/50 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>உள்நுழைக (Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security / System Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>TVK Head Office Authorized Personnel Only</span>
        </div>
      </div>
    </div>
  );
};
