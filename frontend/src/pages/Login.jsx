import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = ({ role }) => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg(t('auth.validationError'));
      return;
    }

    setLoading(true);
    const result = await login(email, password, role);
    setLoading(false);

    if (result.success) {
      // Direct redirect based on MERN role properties resolved inside the hook
      if (email.includes('admin')) {
        navigate('/admin');
      } else if (role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } else {
      const localizedError = typeof result.error === 'object' 
        ? (i18n.language === 'hi' ? result.error.hi : result.error.en)
        : result.error;
      setErrorMsg(localizedError);
    }
  };

  const isTeacher = role === 'teacher';

  return (
    <div className="min-h-screen py-16 flex items-center justify-center relative bg-[#f8fafc]">
      {/* Radial Background glows */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-brand-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="glass-card p-8 sm:p-10 rounded-3xl shadow-premium border border-slate-100 bg-white">
          
          {/* Custom role branding indicator tag */}
          <div className="flex justify-center mb-4">
            <span className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest ${
              isTeacher 
                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                : 'bg-brand-50 text-brand-600 border border-brand-100'
            }`}>
              {isTeacher ? '🎓 Teacher Sign In' : '🎒 Student / Parent Sign In'}
            </span>
          </div>

          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="font-outfit font-black text-3xl text-slate-900 tracking-tight">
              {t('auth.loginHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              {isTeacher 
                ? 'Access your tuition center manager, attendance registers, and fees ledger.'
                : t('auth.loginSub')
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-start space-x-2 text-sm font-semibold animate-shake">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('auth.emailLabel')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isTeacher ? "tutor@gmail.com" : "name@gmail.com"}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('auth.passwordLabel')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm font-semibold"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white font-outfit font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 ${
                isTeacher 
                  ? 'bg-gradient-to-r from-orange-500 to-[#ea580c] hover:from-orange-600 hover:to-orange-700'
                  : 'bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700'
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>{t('auth.loginBtn')}</span>
                </>
              )}
            </button>
          </form>

          {/* Footer toggle */}
          <div className="border-t border-slate-100 mt-8 pt-6 text-center text-sm font-semibold text-slate-500">
            <span>{t('auth.noAccount')}</span>{' '}
            <Link 
              to={isTeacher ? "/register/teacher" : "/register/student"} 
              className={`font-black ml-1 underline hover:scale-105 transition-all ${
                isTeacher ? 'text-orange-600 hover:text-orange-700' : 'text-brand-600 hover:text-brand-700'
              }`}
            >
              {t('auth.registerHeading')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
