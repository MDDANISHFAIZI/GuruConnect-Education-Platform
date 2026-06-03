import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Instagram, Linkedin, Mail } from 'lucide-react';

const CreatorPage = () => {
  const [imgSrc, setImgSrc] = useState('/images/finalphotoforweb.jpeg');

  const handleImgError = () => {
    if (imgSrc === '/images/finalphotoforweb.jpeg') {
      setImgSrc('/finalphotoforweb.jpeg');
    } else {
      setImgSrc(null);
    }
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col justify-center items-center">

      {/* Soft floating background glowing particles (Stripe style) */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Floating dust/stars animations */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10%" cy="20%" r="1" fill="white" className="animate-pulse" />
          <circle cx="30%" cy="60%" r="1.5" fill="white" className="animate-pulse" />
          <circle cx="70%" cy="30%" r="1" fill="white" className="animate-pulse" />
          <circle cx="85%" cy="80%" r="2" fill="white" className="animate-pulse" />
        </svg>
      </div>

      {/* Floating "Back to Home" Button */}
      <div className="w-full max-w-4xl mb-8 relative z-20">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200 group text-sm font-semibold"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-4xl relative z-10">

        {/* Glassmorphism Startup Founder Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 sm:p-12 md:p-16 rounded-[40px] shadow-2xl text-center space-y-8 relative overflow-hidden group hover:border-white/15 transition-all duration-500"
        >
          {/* Glossy card border highlight overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

          {/* Header Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/10 to-indigo-500/10 border border-white/10 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-indigo-300 shadow-inner">
            <span className="text-orange-400">🚀</span>
            <span>Built With Passion</span>
          </div>

          {/* Title & Founder Name */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-slate-400">Meet The Founder</p>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-none">
              Md Danish Faizi Ansari
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-300 pt-1">
              <span>Computer Science & Engineering Student</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-brand-400 font-extrabold">Indian Institute of Technology Patna (IIT Patna)</span>
            </div>
          </div>

          {/* Profile Image with floating and glowing border animations */}
          <div className="flex justify-center items-center py-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full cursor-pointer group"
            >
              {/* Glowing border ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 via-purple-500 to-orange-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Image with fallback vector illustration */}
              <div className="w-full h-full relative z-10 rounded-full overflow-hidden border border-white/10 bg-slate-950 shadow-lg flex items-center justify-center">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt="Md Danish Faizi Ansari"
                    className="w-full h-full object-cover"
                    onError={handleImgError}
                  />
                ) : (
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="avatarSvgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#avatarSvgGrad)" />
                    <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />
                    <path d="M22 84 C22 71, 30 65, 42 63 L45 65 L55 65 L58 63 C70 65, 78 71, 78 84 Z" fill="#0f172a" />
                    <path d="M45 65 L50 78 L55 65 Z" fill="#f1f5f9" />
                    <rect x="46" y="52" width="8" height="12" rx="2" fill="#fed7aa" />
                    <circle cx="50" cy="40" r="14" fill="#fed7aa" />
                    <path d="M36 40 C36 30, 42 24, 50 24 C58 24, 64 30, 64 40 C64 41, 62 42, 60 40 C58 37, 54 36, 50 36 C46 36, 42 37, 40 40 C38 42, 36 41, 36 40 Z" fill="#020617" />
                    <circle cx="44" cy="41" r="3.5" stroke="#020617" strokeWidth="1.5" fill="white" fillOpacity="0.2" />
                    <circle cx="56" cy="41" r="3.5" stroke="#020617" strokeWidth="1.5" fill="white" fillOpacity="0.2" />
                    <line x1="48" y1="41" x2="52" y2="41" stroke="#020617" strokeWidth="1.5" />
                    <path d="M47 47 Q50 50 53 47" stroke="#020617" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                )}
              </div>
            </motion.div>
          </div>

          {/* Mission Quote */}
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-[2rem] font-serif text-white/10 leading-none block h-4 select-none">“</span>
            <p className="text-slate-200 font-outfit font-medium text-base sm:text-lg leading-relaxed px-4">
              Building technology that helps students, parents and teachers connect seamlessly across India.
            </p>
            <span className="text-[2rem] font-serif text-white/10 leading-none block h-4 select-none">”</span>
          </div>

          {/* Social Connect Icons Only */}
          <div className="flex justify-center items-center gap-4 pt-4 border-t border-white/5 max-w-sm mx-auto">
            <a
              href="https://instagram.com/mddanishfaizi"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/5 hover:bg-rose-500/10 border border-white/10 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all duration-300 hover:scale-110"
              title="Instagram"
            >
              <Instagram size={18} />
            </a>

            <a
              href="https://linkedin.com/in/md-danish-faizi-ansari"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/5 hover:bg-sky-500/10 border border-white/10 rounded-2xl text-slate-400 hover:text-sky-400 hover:border-sky-400/30 transition-all duration-300 hover:scale-110"
              title="LinkedIn"
            >
              <Linkedin size={18} />
            </a>

            <a
              href="mailto:danish8809506870@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/5 hover:bg-indigo-500/10 border border-white/10 rounded-2xl text-slate-400 hover:text-indigo-400 hover:border-indigo-400/30 transition-all duration-300 hover:scale-110"
              title="Email"
            >
              <Mail size={18} />
            </a>
          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default CreatorPage;
