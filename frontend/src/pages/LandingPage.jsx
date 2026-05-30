import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { MapPin, Search, BookOpen, ClipboardCheck, Sparkles, HeartHandshake, ShieldCheck, Navigation, Loader2, Compass, Phone, Mail, Instagram, Linkedin, GraduationCap } from 'lucide-react';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Location selector states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Detect GPS location & reverse geocode
  const detectLocation = () => {
    setLoadingLocation(true);
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('GPS not supported by browser.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude: lng, latitude: lat } = position.coords;
        try {
          const { data } = await axios.get(`/api/teachers/geocode/reverse?lat=${lat}&lng=${lng}`);
          let formattedName = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          let area = 'Detected Area';
          if (data && data.address) {
            const addr = data.address;
            area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Area';
            const state = addr.state || '';
            const code = addr.postcode || '';
            formattedName = code ? `${area}, ${state} (${code})` : (state ? `${area}, ${state}` : area);
          }
          navigate('/nearby', {
            state: {
              coordinates: [lng, lat],
              addressName: formattedName,
              areaName: area
            }
          });
        } catch (err) {
          console.error('Reverse Geocode failed:', err);
          navigate('/nearby', {
            state: {
              coordinates: [lng, lat],
              addressName: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
              areaName: 'Detected Area'
            }
          });
        } finally {
          setLoadingLocation(false);
        }
      },
      (err) => {
        console.warn('GPS detection failed:', err);
        setGeoError('GPS failed or timed out. Search manually!');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Real-time autocomplete Nominatim search
  const handleLocationSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length < 3) {
      setSearchSuggestions([]);
      return;
    }

    setSearchingPlaces(true);
    try {
      const { data } = await axios.get(`/api/teachers/geocode/search?q=${encodeURIComponent(val)}`);
      setSearchSuggestions(data || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearchingPlaces(false);
    }
  };

  // Triggered when manual selection is chosen
  const handleSuggestionSelect = (item) => {
    const lng = parseFloat(item.lon);
    const lat = parseFloat(item.lat);
    const addr = item.address || {};
    const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Area';
    const state = addr.state || '';
    const code = addr.postcode || '';
    const formatted = code ? `${area}, ${state} (${code})` : (state ? `${area}, ${state}` : area);
    
    navigate('/nearby', {
      state: {
        coordinates: [lng, lat],
        addressName: formatted,
        areaName: area
      }
    });
  };

  return (
    <div className="overflow-hidden bg-[#f8fafc] relative">
      
      {/* Background Soft Glow Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-3xl pointer-events-none"></div>
 
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto space-y-8"
          >
            {/* Active Tag */}
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 px-4 py-1.5 rounded-full text-xs font-bold text-brand-600 shadow-sm">
              <Sparkles size={14} className="text-[#f97316] animate-pulse" />
              <span>Hyperlocal Learning Ecosystem 🇮🇳</span>
            </motion.div>
 
            {/* Glowing Hero Title */}
            <motion.h1 
              variants={itemVariants} 
              className="font-outfit font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-slate-900 leading-tight"
            >
              {t('hero.title')}
            </motion.h1>
 
            {/* Subtitle */}
            <motion.p 
              variants={itemVariants} 
              className="text-lg md:text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>
 
            {/* Action CTAs: Zomato/Blinkit Location Hub */}
            <motion.div 
              variants={itemVariants}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-premium max-w-2xl mx-auto space-y-4 text-left relative z-20"
            >
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Autocomplete Input */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleLocationSearch}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim().length > 0) {
                        navigate('/nearby', {
                          state: {
                            locationQuery: searchQuery.trim(),
                            addressName: `Search: "${searchQuery.trim()}"`
                          }
                        });
                      }
                    }}
                    placeholder="Search village, locality, city manually..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm font-semibold"
                  />
                  
                  {/* Real-time Autocomplete suggestions */}
                  {searchSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-[220px] overflow-y-auto">
                      {searchSuggestions.map((item) => {
                        const addr = item.address || {};
                        const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || addr.county || 'Area';
                        const state = addr.state || '';
                        return (
                          <button
                            key={item.place_id}
                            onClick={() => handleSuggestionSelect(item)}
                            className="w-full text-left p-3.5 hover:bg-slate-50/80 border-b border-slate-100/60 last:border-0 flex items-start space-x-3 transition-all cursor-pointer"
                          >
                            <span className="text-base mt-0.5">📍</span>
                            <div>
                              <p className="font-extrabold text-slate-800 text-sm">{area}</p>
                              <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{item.display_name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {searchingPlaces && (
                    <div className="absolute right-3 top-3.5 flex items-center text-slate-400 space-x-2 text-xs font-semibold">
                      <Loader2 size={16} className="animate-spin text-brand-500" />
                    </div>
                  )}
                </div>

                {/* Detect GPS Location Button */}
                <button
                  onClick={detectLocation}
                  disabled={loadingLocation}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm px-5 py-3.5 rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex-shrink-0 disabled:opacity-75"
                >
                  {loadingLocation ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Navigation size={16} />
                  )}
                  <span>{loadingLocation ? 'Locating...' : 'Use Current Location'}</span>
                </button>
              </div>

              {/* Instant Text Search Option */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 text-[10px] font-extrabold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Compass size={14} className="text-[#f97316]" />
                  <span>Enter custom place name above & press Enter to search directly</span>
                </span>
                {geoError && (
                  <span className="text-rose-500 font-bold">{geoError}</span>
                )}
              </div>
            </motion.div>

            {/* Dual Role Onboarding CTA Grid */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-6 text-left"
            >
              {/* Student/Parent Section */}
              <div className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium hover:shadow-premium-hover hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">👨‍🎓</span>
                  </div>
                  <h3 className="font-outfit font-black text-xl text-slate-900 flex items-center gap-2">
                    👨‍🎓 Student / Parent
                  </h3>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed">
                    Find nearby trusted tutors, track attendance, access notes and manage fees.
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    to="/signup/student"
                    className="w-full inline-flex items-center justify-center bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-outfit font-black text-sm px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 text-center cursor-pointer"
                  >
                    Sign Up as Student / Parent
                  </Link>
                </div>
              </div>

              {/* Teacher Section */}
              <div className="bg-white/95 backdrop-blur-sm border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium hover:shadow-premium-hover hover:border-orange-200 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">👨‍🏫</span>
                  </div>
                  <h3 className="font-outfit font-black text-xl text-slate-900 flex items-center gap-2">
                    👨‍🏫 Teacher
                  </h3>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed">
                    Grow your coaching, manage students, attendance, fees, homework and notes.
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    to="/signup/teacher"
                    className="w-full inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-outfit font-black text-sm px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 text-center cursor-pointer"
                  >
                    🎓 Become a Tutor
                  </Link>
                </div>
              </div>
            </motion.div>
 
            {/* High-Fidelity Statistics Grid */}
            <motion.div 
              variants={itemVariants} 
              className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-12 border-t border-slate-200/60"
            >
              <div className="text-center px-2">
                <p className="font-outfit font-black text-2xl sm:text-3xl text-brand-600 tracking-tight">1,200+</p>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">{t('hero.statsTeachers')}</p>
              </div>
              <div className="text-center border-x border-slate-200 px-2">
                <p className="font-outfit font-black text-2xl sm:text-3xl text-[#f97316] tracking-tight">10,000+</p>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">{t('hero.statsStudents')}</p>
              </div>
              <div className="text-center px-2">
                <p className="font-outfit font-black text-2xl sm:text-3xl text-emerald-600 tracking-tight">450+</p>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">{t('hero.statsVillages')}</p>
              </div>
            </motion.div>
 
          </motion.div>
        </div>
      </section>
 
      {/* How it Works Section */}
      <section id="how" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-outfit font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              {t('hero.howItWorks')}
            </h2>
            <div className="h-1 w-20 bg-brand-500 mx-auto rounded-full"></div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="glass-card p-8 rounded-3xl border border-slate-100 hover:border-brand-100 hover:shadow-premium transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-500 mb-6 group-hover:scale-110 transition-transform">
                <MapPin size={28} className="text-[#f97316]" />
              </div>
              <h3 className="font-outfit font-extrabold text-xl text-slate-900 mb-3">{t('hero.step1')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('hero.step1Text')}</p>
            </div>
 
            {/* Step 2 */}
            <div className="glass-card p-8 rounded-3xl border border-slate-100 hover:border-brand-100 hover:shadow-premium transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-500 mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={28} className="text-brand-500" />
              </div>
              <h3 className="font-outfit font-extrabold text-xl text-slate-900 mb-3">{t('hero.step2')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('hero.step2Text')}</p>
            </div>
 
            {/* Step 3 */}
            <div className="glass-card p-8 rounded-3xl border border-slate-100 hover:border-brand-100 hover:shadow-premium transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-500 mb-6 group-hover:scale-110 transition-transform">
                <ClipboardCheck size={28} className="text-emerald-500" />
              </div>
              <h3 className="font-outfit font-extrabold text-xl text-slate-900 mb-3">{t('hero.step3')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('hero.step3Text')}</p>
            </div>
          </div>
        </div>
      </section>
 
      {/* Social Philosophy & Impact Section */}
      <section className="py-24 bg-gradient-to-r from-brand-500 to-indigo-700 text-white relative overflow-hidden">
        {/* Soft background visual ring */}
        <div className="absolute -bottom-10 -left-10 w-96 h-96 border-4 border-white/10 rounded-full pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-96 h-96 border-4 border-white/10 rounded-full pointer-events-none"></div>
 
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/15 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <HeartHandshake size={14} className="text-orange-400" />
            <span>{t('hero.philosophyTitle')}</span>
          </div>
 
          <h2 className="font-outfit font-extrabold text-3xl sm:text-5xl leading-tight">
            Fair Visibility For Neighborhood Talents
          </h2>
 
          <p className="text-lg md:text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed font-medium">
            {t('hero.philosophyDesc')}
          </p>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6 text-left">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xs flex items-start space-x-4">
              <ShieldCheck size={28} className="text-emerald-300 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-lg mb-1">Verify Educators Locally</h4>
                <p className="text-xs text-indigo-200 leading-relaxed">Collaborating with local representatives and Panchayats to ensure background credibility in rural towns.</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xs flex items-start space-x-4">
              <BookOpen size={28} className="text-orange-300 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-lg mb-1">Empower Rural Women Teachers</h4>
                <p className="text-xs text-indigo-200 leading-relaxed">Providing high-grade discoverability to skilled educated women tutoring local children at home.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Founder CTA Section */}
      <section className="py-20 bg-slate-50 relative border-t border-slate-100/60 overflow-hidden">
        
        {/* Soft glowing colorful lights (Razorpay/CRED style) */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Floating dust/particle animation in background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full">
            <circle cx="15%" cy="30%" r="1.5" fill="#4f46e5" className="animate-ping" />
            <circle cx="85%" cy="70%" r="2" fill="#f97316" className="animate-ping" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bg-white/90 backdrop-blur-md border border-slate-100 p-8 sm:p-12 md:p-16 rounded-[40px] shadow-premium hover:shadow-premium-hover transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left group"
          >
            {/* Soft inner glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/10 via-transparent to-orange-50/10 pointer-events-none"></div>

            {/* Left side: Context Content */}
            <div className="space-y-4 max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-orange-50 to-indigo-50 border border-brand-100 px-3.5 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                <span className="text-orange-500 animate-pulse">🚀</span>
                <span>Meet The Founder</span>
              </div>
              
              {/* Title & Description */}
              <h3 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight leading-tight">
                Curious who built GuruConnect?
              </h3>
              
              <p className="text-slate-600 text-sm sm:text-base font-semibold leading-relaxed">
                Learn about the IIT Patna student behind this hyperlocal education platform and the vision driving it.
              </p>
            </div>

            {/* Right side: Glowing Pulsing Button */}
            <div className="relative flex-shrink-0 group/btn">
              {/* Glowing backing element */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-600 rounded-2xl blur-md opacity-60 group-hover/btn:opacity-100 transition duration-300 animate-pulse"></div>
              
              <Link
                to="/creator"
                className="relative inline-flex items-center justify-center bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-outfit font-black text-sm px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>👨‍💻 Know The Creator</span>
              </Link>
            </div>

          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
