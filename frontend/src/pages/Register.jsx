import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, AlertCircle, Sparkles, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { CLASS_OPTIONS, SUBJECT_OPTIONS, LANGUAGE_OPTIONS } from '../utils/studentCurriculum';

const Register = ({ role }) => {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [studentClass, setStudentClass] = useState('Class 7');
  const [curriculum, setCurriculum] = useState('CBSE');
  const [subjects, setSubjects] = useState(['Maths', 'Science']);
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleSubject = (subName) => {
    if (subjects.includes(subName)) {
      if (subjects.length > 1) {
        setSubjects(prev => prev.filter(s => s !== subName));
      }
    } else {
      setSubjects(prev => [...prev, subName]);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedExtensions.includes(file.type)) {
        setErrorMsg('Please select a JPG, JPEG, PNG, or WEBP profile image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Maximum profile picture size allowed is 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result); // base64 representation
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone || !password || !role) {
      setErrorMsg(t('auth.validationError'));
      return;
    }

    setLoading(true);
    const extraData = !isTeacher ? { class: studentClass, curriculum, subjects, preferredLanguage } : {};
    const result = await register(name, email, password, role, phone, profilePhoto, extraData);
    setLoading(false);

    if (result.success) {
      navigate('/verify-email', { state: { email } });
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
      {/* Background radial glows */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-brand-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg px-4 relative z-10">
        <div className="glass-card p-8 sm:p-10 rounded-3xl shadow-premium border border-slate-100 bg-white">
          
          {/* Custom role branding tag */}
          <div className="flex justify-center mb-4">
            <span className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest ${
              isTeacher 
                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                : 'bg-brand-50 text-brand-600 border border-brand-100'
            }`}>
              {isTeacher ? '🎓 Teacher Registration' : '🎒 Student / Parent Registration'}
            </span>
          </div>

          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="font-outfit font-black text-3xl text-slate-900 tracking-tight">
              {t('auth.registerHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
              {isTeacher 
                ? 'Become discoverable within a 2km radius and digitize attendance and fees registers.'
                : 'Save neighborhood tutors, track offline schedules, and verify monthly billing balances.'
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

            {/* Profile Photo Device Upload */}
            <div className="flex flex-col items-center space-y-2 pb-4 border-b border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 self-start">
                Profile Photo (Optional)
              </label>
              
              <div className="flex items-center space-x-4 w-full">
                {/* Preview Thumbnail */}
                <div className="h-16 w-16 bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative group">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={() => setProfilePhoto('')}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer border border-transparent"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex-grow text-left">
                  <input
                    type="file"
                    accept="image/*"
                    id="register-profile-photo"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="register-profile-photo"
                    className="inline-block px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer border border-slate-200"
                  >
                    {profilePhoto ? 'Change Photo' : 'Upload From Device'}
                  </label>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">Supports JPG, JPEG, PNG, WEBP</p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('auth.nameLabel')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm font-semibold"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('auth.phoneLabel')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Phone size={18} />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm font-semibold"
                />
              </div>
            </div>

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
                  placeholder="name@gmail.com"
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide Password" : "Show Password"}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Student Grade, Curriculum, Language & Subjects (Only for Students) */}
            {!isTeacher && (
              <div className="space-y-3.5 pt-1 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <GraduationCap size={14} className="text-brand-500" />
                      <span>Class / Grade</span>
                    </label>
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 outline-none text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      {CLASS_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Board / Curriculum
                    </label>
                    <select
                      value={curriculum}
                      onChange={(e) => setCurriculum(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 outline-none text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      <option value="CBSE">CBSE Board</option>
                      <option value="ICSE">ICSE / CISCE</option>
                      <option value="State Board">State Board</option>
                      <option value="Other">Other Curriculum</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Preferred Language
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 outline-none text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang.id} value={lang.id}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Subjects to Study */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Subjects you want to study
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBJECT_OPTIONS.map((sub) => {
                      const isSelected = subjects.includes(sub.name);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSubject(sub.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border cursor-pointer ${
                            isSelected
                              ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{sub.icon}</span>
                          <span>{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-white font-outfit font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75 mt-2 ${
                isTeacher
                  ? 'bg-gradient-to-r from-orange-500 to-[#ea580c] hover:from-orange-600 hover:to-orange-700'
                  : 'bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700'
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer toggle */}
          <div className="border-t border-slate-100 mt-8 pt-6 text-center text-sm font-semibold text-slate-500">
            <span>{t('auth.haveAccount')}</span>{' '}
            <Link 
              to={isTeacher ? "/login/teacher" : "/login/student"} 
              className={`font-black ml-1 underline hover:scale-105 transition-all ${
                isTeacher ? 'text-orange-600 hover:text-orange-700' : 'text-brand-600 hover:text-brand-700'
              }`}
            >
              {t('auth.loginBtn')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
