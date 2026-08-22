import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, Flame, KeyRound, Eye, EyeOff } from 'lucide-react';

export const UnifiedAuth = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          password: formData.password
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid name/email or password');
      }
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 shadow-xl shadow-amber-500/25 mb-4 text-white">
            <Flame className="w-8 h-8 fill-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              LionIX
            </h1>
            <span className="text-xl font-bold text-amber-600">Task Report</span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Sign in to access your portal (Admin or Employee)
          </p>
        </div>

        {/* White Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Account Sign In
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              IT Portal
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                First Name or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ritesh, Rohith, Sravani or email"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password (default: Lionixllp)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 rounded-lg transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-extrabold shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Sign In to LionIX</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Admin Managed Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              🔑 <strong>Employee Quick Login:</strong> Type your <strong>First Name</strong> (e.g. <code className="text-amber-800 font-bold font-mono">Ritesh</code>) and password <code className="text-amber-800 font-bold font-mono">Lionixllp</code> to sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export { UnifiedAuth as EmployeeAuth };
