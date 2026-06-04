import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const VerifyForgotOTP = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || localStorage.getItem('verify_forgot_email_temp') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (email) {
      localStorage.setItem('verify_forgot_email_temp', email);
    }
  }, [email]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg(i18n.language === 'hi' ? 'ईमेल पता आवश्यक है।' : 'Email address is required.');
      return;
    }
    if (!otp || otp.trim().length !== 6) {
      setErrorMsg(i18n.language === 'hi' ? 'कृपया ६ अंकों का पुनर्प्राप्ति कोड दर्ज करें।' : 'Please enter the 6-digit recovery code.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/verify-forgot-otp', {
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });

      setSuccessMsg(i18n.language === 'hi' ? 'ओटीपी सफलतापूर्वक सत्यापित किया गया!' : 'OTP verified successfully!');
      localStorage.removeItem('verify_forgot_email_temp');

      setTimeout(() => {
        navigate('/reset-password', { 
          state: { 
            email: email.trim().toLowerCase(), 
            otp: otp.trim() 
          } 
        });
      }, 1500);
    } catch (err) {
      const errData = err.response?.data?.message;
      const localizedError = typeof errData === 'object'
        ? (i18n.language === 'hi' ? errData.hi : errData.en)
        : (errData || (i18n.language === 'hi' ? 'सत्यापन विफल रहा।' : 'Verification failed.'));
      setErrorMsg(localizedError);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resendLoading) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg(i18n.language === 'hi' ? 'ईमेल पता आवश्यक है।' : 'Email address is required.');
      return;
    }

    setResendLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });

      setSuccessMsg(i18n.language === 'hi' ? 'एक नया पुनर्प्राप्ति कोड भेजा गया है।' : 'A new recovery code has been sent.');
      setTimer(60);
    } catch (err) {
      const errData = err.response?.data?.message;
      const localizedError = typeof errData === 'object'
        ? (i18n.language === 'hi' ? errData.hi : errData.en)
        : (errData || (i18n.language === 'hi' ? 'ओटीपी भेजने में विफल।' : 'Failed to send OTP.'));
      setErrorMsg(localizedError);
    } finally {
      setResendLoading(false);
    }
  };

  const isHindi = i18n.language === 'hi';

  return (
    <div className="min-h-screen py-16 flex items-center justify-center relative bg-[#f8fafc]">
      {/* Background radial glows */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-brand-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="glass-card p-8 sm:p-10 rounded-3xl shadow-premium border border-slate-100 bg-white">
          
          {/* Logo Icon Header */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-orange-50 rounded-full border border-orange-100 text-orange-600 animate-pulse">
              <ShieldCheck size={36} />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {isHindi ? 'रिकवरी कोड सत्यापित करें' : 'Verify Recovery Code'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              {isHindi 
                ? 'हमने आपके ईमेल पर ६ अंकों का पासवर्ड पुनर्प्राप्ति कोड भेजा है।'
                : 'We have sent a 6-digit password recovery code to your email.'
              }
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
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

            {/* Email field - editable if not passed/determined */}
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
                  disabled={!!location.state?.email}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm font-semibold disabled:opacity-75 disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* OTP input field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isHindi ? 'पुनर्प्राप्ति कोड (OTP)' : 'Recovery Code (OTP)'}
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[12px] py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-2xl font-bold focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-semibold"
              />
            </div>

            {/* Verify button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white bg-gradient-to-r from-orange-500 to-[#ea580c] hover:from-orange-600 hover:to-orange-700 font-outfit font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isHindi ? 'सत्यापन करें' : 'Verify Code'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Resend Actions */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center space-y-3">
            <div className="text-sm font-semibold text-slate-500">
              {timer > 0 ? (
                <span>
                  {isHindi ? `कोड पुनः भेजें (${timer} सेकंड)` : `Resend code in ${timer}s`}
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-brand-600 hover:text-brand-700 underline font-black flex items-center space-x-1 cursor-pointer transition-all hover:scale-105"
                >
                  {resendLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <span>{isHindi ? 'नया कोड भेजें' : 'Resend Recovery Code'}</span>
                  )}
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 font-medium">
              <Link to="/login" className="underline text-slate-500 font-bold">
                {isHindi ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerifyForgotOTP;
