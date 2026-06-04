import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { KeyRound, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg(i18n.language === 'hi' ? 'कृपया अपना ईमेल पता दर्ज करें।' : 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });

      setSuccessMsg(i18n.language === 'hi' ? 'पुनर्प्राप्ति ओटीपी कोड आपके ईमेल पर भेजा गया है!' : 'Recovery OTP code has been sent to your email!');
      
      // Redirect to Verify OTP page, passing the email state
      setTimeout(() => {
        navigate('/verify-forgot-otp', { state: { email: email.trim().toLowerCase() } });
      }, 2000);
    } catch (err) {
      const errData = err.response?.data?.message;
      const localizedError = typeof errData === 'object'
        ? (i18n.language === 'hi' ? errData.hi : errData.en)
        : (errData || (i18n.language === 'hi' ? 'अनुरोध विफल रहा।' : 'Request failed.'));
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
            <div className="p-4 bg-orange-50 rounded-full border border-orange-100 text-orange-600">
              <KeyRound size={36} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {isHindi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              {isHindi 
                ? 'अपने खाते से जुड़ा ईमेल पता दर्ज करें और हम आपको एक पासवर्ड रीसेट कोड भेजेंगे।'
                : 'Enter your registered email address and we will send you a password reset OTP.'
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

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isHindi ? 'ईमेल पता' : 'Email Address'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm font-semibold"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white bg-gradient-to-r from-orange-500 to-[#ea580c] hover:from-orange-600 hover:to-orange-700 font-outfit font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isHindi ? 'ओटीपी कोड भेजें' : 'Send Recovery Code'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer toggle */}
          <div className="border-t border-slate-100 mt-8 pt-6 text-center text-sm font-semibold text-slate-500">
            <span>{isHindi ? 'लॉगिन याद आ गया?' : 'Remembered your password?'}</span>{' '}
            <Link 
              to="/login" 
              className="font-black ml-1 underline hover:scale-105 transition-all text-brand-600 hover:text-brand-700"
            >
              {isHindi ? 'लॉगिन करें' : 'Sign In'}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
