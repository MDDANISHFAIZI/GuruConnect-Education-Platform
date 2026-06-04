import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Check, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Security check: if email/otp are missing from state, redirect back to forgot-password
  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || !confirmPassword) {
      setErrorMsg(i18n.language === 'hi' ? 'कृपया सभी फ़ील्ड भरें।' : 'Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg(i18n.language === 'hi' ? 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(i18n.language === 'hi' ? 'दोनों पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });

      setSuccessMsg(i18n.language === 'hi' ? 'पासवर्ड सफलतापूर्वक रीसेट किया गया!' : 'Password reset successfully!');
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      const errData = err.response?.data?.message;
      const localizedError = typeof errData === 'object'
        ? (i18n.language === 'hi' ? errData.hi : errData.en)
        : (errData || (i18n.language === 'hi' ? 'पासवर्ड रीसेट विफल रहा।' : 'Password reset failed.'));
      setErrorMsg(localizedError);
    } finally {
      setLoading(false);
    }
  };

  const isHindi = i18n.language === 'hi';

  return (
    <div className="min-h-screen py-16 flex items-center justify-center relative bg-[#f8fafc]">
      {/* Background radial glows */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-brand-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="glass-card p-8 sm:p-10 rounded-3xl shadow-premium border border-slate-100 bg-white">
          
          {/* Icon Header */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-600">
              <Lock size={36} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {isHindi ? 'नया पासवर्ड सेट करें' : 'Set New Password'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              {isHindi 
                ? 'अपने खाते के लिए एक मजबूत और सुरक्षित पासवर्ड चुनें।'
                : 'Choose a strong and secure password for your account.'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-start space-x-2 text-sm font-semibold animate-shake">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl flex items-start space-x-2 text-sm font-semibold">
                <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isHindi ? 'नया पासवर्ड' : 'New Password'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isHindi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Security feedback indicators */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
                <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>{isHindi ? 'कम से कम ६ अक्षर' : 'At least 6 characters'}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
                <div className={`w-1.5 h-1.5 rounded-full ${newPassword && newPassword === confirmPassword ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>{isHindi ? 'दोनों पासवर्ड मेल खाते हैं' : 'Passwords match'}</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-outfit font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isHindi ? 'पासवर्ड रीसेट करें' : 'Reset Password'}</span>
                  <Check size={18} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
