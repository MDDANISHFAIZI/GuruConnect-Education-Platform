import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getProfilePhotoUrl, handleProfileImageError } from '../utils/image';
import { 
  Globe, Menu, X, LogOut, User, ChevronDown, 
  Settings, BookOpen, Users, ClipboardCheck, 
  DollarSign, UserPlus, Heart, MessageSquare, Shield,
  Bell, CheckCheck
} from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Poll notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await axios.put(`/api/notifications/read/${notif._id}`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      }
      setNotificationDropdownOpen(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ENROLLMENT_REQUEST':
        return <UserPlus size={14} />;
      case 'ENROLLMENT_ACCEPTED':
        return <ClipboardCheck size={14} />;
      case 'NEW_NOTE':
        return <BookOpen size={14} />;
      case 'NEW_DOUBT':
        return <MessageSquare size={14} />;
      case 'DOUBT_REPLY':
        return <MessageSquare size={14} className="text-emerald-500" />;
      case 'ATTENDANCE_MARKED':
        return <ClipboardCheck size={14} className="text-indigo-500" />;
      case 'FEE_DUE':
        return <DollarSign size={14} className="text-rose-500" />;
      case 'ANNOUNCEMENT':
        return <Globe size={14} className="text-amber-500" />;
      default:
        return <Bell size={14} />;
    }
  };

  const formatTimeAgo = (dateStr) => {
    try {
      const diffMs = new Date() - new Date(dateStr);
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return i18n.language === 'hi' ? 'अभी' : 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return i18n.language === 'hi' ? 'कल' : 'Yesterday';
      return new Date(dateStr).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Toggle bilingual state
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('i18nextLng', nextLang);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setNotificationDropdownOpen(false);
    navigate('/');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Disable page scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isTeacher = user?.role === 'teacher';
  
  // Custom role labels and badges
  const roleLabel = isTeacher ? 'Teacher' : user?.role === 'student' ? 'Student' : 'Admin';
  const roleBadgeStyle = isTeacher
    ? 'bg-orange-50 border-orange-100 text-orange-600'
    : 'bg-indigo-50 border-indigo-100 text-indigo-600';

  return (
    <nav className="sticky top-0 z-50 glass-nav shadow-sm bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo Brand Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="GuruConnect Logo"
                  className="h-14 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                /* Exquisite SVG replication of the user's uploaded logo! */
                <svg className="w-12 h-12" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 20 C140 20, 175 45, 175 90 C175 110, 165 125, 155 135" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
                  <path d="M100 20 C60 20, 25 45, 25 90 C25 115, 40 135, 60 145" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
                  <path d="M100 170 L65 120 C50 100, 60 90, 85 95 L100 100 L115 95 C140 90, 150 100, 135 120 Z" fill="#22c55e" />
                  <path d="M100 170 L65 120 C75 110, 90 105, 100 110 L100 170" fill="#15803d" />
                  <circle cx="100" cy="145" r="5" fill="white" />
                  <path d="M100 40 L135 52 L100 64 L65 52 Z" fill="#1e293b" />
                  <rect x="85" y="58" width="30" height="12" fill="#1e293b" rx="2" />
                  <line x1="135" y1="52" x2="140" y2="70" stroke="#f97316" strokeWidth="3" />
                  <circle cx="140" cy="70" r="4" fill="#f97316" />
                  <circle cx="88" cy="78" r="8" stroke="#1e293b" strokeWidth="3" />
                  <circle cx="112" cy="78" r="8" stroke="#1e293b" strokeWidth="3" />
                  <path d="M96 78 C98 75, 102 75, 104 78" stroke="#1e293b" strokeWidth="3" fill="none" />
                  <path d="M55 75 C55 68, 65 68, 65 75 C65 82, 55 88, 55 92" stroke="#f97316" strokeWidth="2.5" fill="#f97316" />
                  <circle cx="145" cy="80" r="7" fill="#22c55e" opacity="0.8" />
                  <circle cx="160" cy="86" r="5" fill="#1d4ed8" opacity="0.8" />
                </svg>
              )}
              
              <div className="flex flex-col">
                <span className="font-outfit font-extrabold text-2xl tracking-tight leading-none">
                  <span className="text-[#1d4ed8]">Guru</span>
                  <span className="text-[#f97316]">Connect</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-semibold font-sans mt-0.5">
                  {t('nav.tagline') || 'Hyperlocal Tutor Network'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Find Tutors Link */}
            <Link 
              to="/nearby" 
              className="text-slate-600 hover:text-brand-500 font-bold transition-all px-3 py-2 rounded-lg hover:bg-slate-50 text-sm"
            >
              Find Tutors
            </Link>

            {/* Auth Dropdowns / Premium Dropdown Section */}
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Bell Notification Icon */}
                <div className="relative" ref={notificationDropdownRef}>
                  <button
                    onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                    className="relative p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-brand-500 rounded-full transition-all duration-200 outline-none border border-slate-100 hover:border-slate-200 cursor-pointer"
                  >
                    <Bell size={20} className={unreadCount > 0 ? "animate-pulse" : ""} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white shadow-sm">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {notificationDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-96 rounded-3xl bg-white border border-slate-150 shadow-premium p-4 z-[99] animate-fade-in flex flex-col max-h-[480px]">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                        <h3 className="font-outfit font-extrabold text-sm text-slate-800 flex items-center gap-2">
                          <span>🔔 {i18n.language === 'hi' ? 'सूचनाएं' : 'Notifications'}</span>
                          {unreadCount > 0 && (
                            <span className="bg-rose-50 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100 font-sans">
                              {unreadCount} {i18n.language === 'hi' ? 'नया' : 'new'}
                            </span>
                          )}
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer transition-colors border-none bg-transparent"
                          >
                            <CheckCheck size={14} />
                            <span>{i18n.language === 'hi' ? 'सभी पढ़े गए मार्क करें' : 'Mark all read'}</span>
                          </button>
                        )}
                      </div>

                      {/* Notification List (Scrollable) */}
                      <div className="overflow-y-auto space-y-2 flex-grow pr-1 max-h-[350px]">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                            <span className="text-3xl">📭</span>
                            <p className="text-xs font-bold text-slate-400">
                              {i18n.language === 'hi' ? 'कोई नई सूचना नहीं है' : 'No notifications yet'}
                            </p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm flex items-start gap-3 ${
                                notif.read
                                  ? 'bg-slate-50/50 border-slate-100/60 hover:bg-slate-50'
                                  : 'bg-indigo-50/10 border-indigo-100/40 hover:bg-indigo-50/20'
                              }`}
                            >
                              {/* Type-based Icon/Indicator */}
                              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                                notif.read ? 'bg-slate-100 text-slate-400' : 'bg-brand-50 text-brand-500'
                              }`}>
                                {getNotificationIcon(notif.type)}
                              </div>

                              {/* Text content */}
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className={`text-xs font-extrabold truncate ${
                                    notif.read ? 'text-slate-600' : 'text-slate-800'
                                  }`}>
                                    {notif.title}
                                  </h4>
                                  <span className="text-[9px] text-slate-400 font-semibold shrink-0 mt-0.5">
                                    {formatTimeAgo(notif.createdAt)}
                                  </span>
                                </div>
                                <p className={`text-[11px] mt-1 break-words line-clamp-2 leading-relaxed ${
                                  notif.read ? 'text-slate-400' : 'text-slate-600 font-medium'
                                }`}>
                                  {notif.message}
                                </p>
                              </div>

                              {/* Unread dot */}
                              {!notif.read && (
                                <div className="w-2.5 h-2.5 bg-brand-500 rounded-full shrink-0 mt-1.5 animate-pulse" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Top Widget Trigger */}
                <div className="relative" ref={dropdownRef}>
                {/* Profile Top Widget Trigger */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer outline-none group border border-transparent hover:border-slate-100"
                >
                  {/* Photo or circular fallback */}
                  <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 shadow-sm bg-slate-50">
                    {getProfilePhotoUrl(user.profilePhoto || user.profileImage) ? (
                      <img 
                        src={getProfilePhotoUrl(user.profilePhoto || user.profileImage)} 
                        alt={user.name} 
                        className="h-full w-full object-cover" 
                        onError={handleProfileImageError}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Styled Username & arrow */}
                  <div className="flex items-center space-x-1.5 text-left">
                    <span className="text-slate-700 font-extrabold text-sm group-hover:text-brand-600 transition-colors">
                      {isTeacher ? `🎓 ${user.name}` : `👤 ${user.name}`}
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 group-hover:text-brand-600 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* PREMIUM GLASSMORPHISM DROPDOWN MENU */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-100 shadow-premium p-4 z-[99] animate-fade-in space-y-4">
                    
                    {/* User Identity Details Card */}
                    <div className="bg-slate-50/50 border border-slate-100/50 p-3 rounded-2xl flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white shadow-sm bg-slate-50">
                        {getProfilePhotoUrl(user.profilePhoto || user.profileImage) ? (
                          <img src={getProfilePhotoUrl(user.profilePhoto || user.profileImage)} alt={user.name} className="h-full w-full object-cover" onError={handleProfileImageError} />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-left leading-tight">
                        <p className="font-extrabold text-sm text-slate-800 truncate max-w-[180px]">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[180px] mt-0.5">{user.email}</p>
                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border mt-1.5 ${roleBadgeStyle}`}>
                          {roleLabel}
                        </span>
                        {user.emailVerified ? (
                          <span className="inline-flex items-center text-[9px] font-extrabold px-2 py-0.5 rounded-full border mt-1.5 ml-1 bg-emerald-50 border-emerald-100 text-emerald-600">
                            ✓ Verified
                          </span>
                        ) : (
                          <Link 
                            to="/verify-email" 
                            onClick={() => setDropdownOpen(false)}
                            className="inline-flex items-center text-[9px] font-extrabold px-2 py-0.5 rounded-full border mt-1.5 ml-1 bg-rose-50 border-rose-100 text-rose-600 hover:scale-105 transition-all"
                          >
                            ⚠ Verify Email
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-slate-100/60 my-2"></div>

                    {/* Role-Based Navigation Items */}
                    <div className="space-y-1">
                      
                      <Link 
                        to="/profile" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 text-slate-700 hover:text-brand-600 font-bold p-2.5 rounded-xl hover:bg-brand-50/40 transition-all text-xs text-left"
                      >
                        <User size={16} className="text-brand-500" />
                        <span>My Profile</span>
                      </Link>

                      <Link 
                        to={isTeacher ? '/teacher' : '/student'} 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 text-slate-700 hover:text-brand-600 font-bold p-2.5 rounded-xl hover:bg-brand-50/40 transition-all text-xs text-left"
                      >
                        <Shield size={16} className="text-brand-500" />
                        <span>Dashboard</span>
                      </Link>

                      {isTeacher ? (
                        <>
                          <Link 
                            to="/teacher?tab=students" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 text-slate-700 hover:text-[#f97316] font-bold p-2.5 rounded-xl hover:bg-orange-50/30 transition-all text-xs text-left"
                          >
                            <Users size={16} className="text-[#f97316]" />
                            <span>My Students</span>
                          </Link>

                          <Link 
                            to="/teacher?tab=requests" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 text-slate-700 hover:text-[#f97316] font-bold p-2.5 rounded-xl hover:bg-orange-50/30 transition-all text-xs text-left"
                          >
                            <UserPlus size={16} className="text-[#f97316]" />
                            <span>Pending Requests</span>
                          </Link>

                          <Link 
                            to="/teacher?tab=attendance" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 text-slate-700 hover:text-[#f97316] font-bold p-2.5 rounded-xl hover:bg-orange-50/30 transition-all text-xs text-left"
                          >
                            <ClipboardCheck size={16} className="text-[#f97316]" />
                            <span>Attendance</span>
                          </Link>

                          <Link 
                            to="/teacher?tab=fees" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 text-slate-700 hover:text-[#f97316] font-bold p-2.5 rounded-xl hover:bg-orange-50/30 transition-all text-xs text-left"
                          >
                            <DollarSign size={16} className="text-[#f97316]" />
                            <span>Fee Management</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link 
                            to="/student?tab=favorites" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 text-slate-700 hover:text-brand-600 font-bold p-2.5 rounded-xl hover:bg-brand-50/40 transition-all text-xs text-left"
                          >
                            <Heart size={16} className="text-brand-500" />
                            <span>Saved Teachers</span>
                          </Link>

                          <Link 
                            to="/student?tab=requests" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 text-slate-700 hover:text-brand-600 font-bold p-2.5 rounded-xl hover:bg-brand-50/40 transition-all text-xs text-left"
                          >
                            <MessageSquare size={16} className="text-brand-500" />
                            <span>My Requests</span>
                          </Link>

                          <Link 
                            to="/student?tab=billing" 
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center space-x-3 text-slate-700 hover:text-brand-600 font-bold p-2.5 rounded-xl hover:bg-brand-50/40 transition-all text-xs text-left"
                          >
                            <DollarSign size={16} className="text-brand-500" />
                            <span>Fees & Receipts</span>
                          </Link>
                        </>
                      )}

                      <Link 
                        to="/profile" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 text-slate-700 hover:text-brand-600 font-bold p-2.5 rounded-xl hover:bg-brand-50/40 transition-all text-xs text-left"
                      >
                        <Settings size={16} className="text-brand-500" />
                        <span>Settings</span>
                      </Link>

                      {/* Integrated Language Switch */}
                      <button
                        onClick={() => {
                          toggleLanguage();
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 text-slate-700 hover:text-brand-600 font-bold p-2.5 rounded-xl hover:bg-brand-50/40 transition-all text-xs text-left cursor-pointer border border-transparent"
                      >
                        <Globe size={16} className="text-brand-500" />
                        <span>Language: {i18n.language === 'en' ? 'हिन्दी (Hindi)' : 'English'}</span>
                      </button>

                    </div>

                    <div className="border-t border-slate-100/60 my-2"></div>

                    {/* Logout Option */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 text-rose-600 hover:bg-rose-50 font-bold p-2.5 rounded-xl transition-all text-xs cursor-pointer border border-transparent"
                    >
                      <LogOut size={16} />
                      <span>{t('nav.logout') || 'Logout'}</span>
                    </button>

                  </div>
                )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                
                {/* Sleek Sign In Dropdown */}
                <div className="relative group py-2">
                  <button className="text-slate-700 hover:text-brand-500 font-bold px-3 py-2.5 transition-all flex items-center gap-1 outline-none cursor-pointer">
                    <span>{t('nav.login')}</span>
                    <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute right-0 top-full w-48 rounded-2xl bg-white border border-slate-100 shadow-premium p-2 hidden group-hover:block animate-fade-in z-[99]">
                    <Link to="/login/student" className="block p-3 text-xs font-bold text-slate-700 hover:text-brand-600 hover:bg-brand-50/50 rounded-xl transition-all">🎒 Student Login</Link>
                    <Link to="/login/teacher" className="block p-3 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50/30 rounded-xl transition-all">🎓 Teacher Login</Link>
                  </div>
                </div>

                {/* Sleek Sign Up Dropdown */}
                <div className="relative group py-2">
                  <button className="bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1 cursor-pointer">
                    <span>{t('nav.register')}</span>
                    <ChevronDown size={14} className="text-indigo-200 group-hover:rotate-180 transition-transform duration-300" />
                  </button>
                  <div className="absolute right-0 top-full w-56 rounded-2xl bg-white border border-slate-100 shadow-premium p-2 hidden group-hover:block animate-fade-in z-[99]">
                    <Link to="/signup/student" className="block p-3 text-xs font-bold text-slate-700 hover:text-brand-600 hover:bg-brand-50/50 rounded-xl transition-all">🎒 Sign Up as Student / Parent</Link>
                    <Link to="/signup/teacher" className="block p-3 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50/30 rounded-xl transition-all">🎓 Sign Up as Teacher</Link>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Mobile menu controls */}
          <div className="flex items-center md:hidden space-x-2.5">
            {user && (
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                  className="relative p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer border-none"
                >
                  <Bell size={20} className={unreadCount > 0 ? "animate-pulse" : ""} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationDropdownOpen && (
                  <div className="absolute right-[-60px] sm:right-0 mt-3 w-80 sm:w-90 rounded-2xl bg-white border border-slate-150 shadow-lg p-3 z-[9999] animate-fade-in flex flex-col max-h-[400px]">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                      <span className="font-extrabold text-xs text-slate-800">🔔 {i18n.language === 'hi' ? 'सूचनाएं' : 'Notifications'}</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-brand-600 border-none bg-transparent"
                        >
                          {i18n.language === 'hi' ? 'सभी पढ़े गए' : 'Mark all read'}
                        </button>
                      )}
                    </div>
                    {/* Scroll list */}
                    <div className="overflow-y-auto space-y-1.5 max-h-[300px]">
                      {notifications.length === 0 ? (
                        <p className="text-[10px] text-slate-400 py-4 text-center font-bold">
                          {i18n.language === 'hi' ? 'कोई नई सूचना नहीं है' : 'No notifications yet'}
                        </p>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2 ${
                              notif.read ? 'bg-slate-50/50 border-slate-100' : 'bg-indigo-50/10 border-indigo-100'
                            }`}
                          >
                            <div className="text-[10px] shrink-0 mt-0.5">{getNotificationIcon(notif.type)}</div>
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-center gap-1">
                                <h4 className="text-[10px] font-bold truncate text-slate-800">{notif.title}</h4>
                                <span className="text-[8px] text-slate-400 shrink-0">{formatTimeAgo(notif.createdAt)}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 break-words line-clamp-2">{notif.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={toggleLanguage}
              className="p-2.5 bg-slate-100 rounded-full text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Change Language"
            >
              <Globe size={20} className="text-brand-500" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/35 backdrop-blur-[8px] z-[9998] transition-opacity duration-300 md:hidden"
        />
      )}

      {/* MOBILE DRAWER SIDEBAR MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 animate-slide-down shadow-xl fixed top-20 left-0 w-full bg-white max-h-[calc(100vh-5rem)] overflow-y-auto z-[9999]">
          <div className="px-4 pt-4 pb-6 space-y-4">
            
            {user ? (
              /* MOBILE PORTRAIT PROFILE SECTION CARD */
              <div className="space-y-4">
                
                {/* Visual Identity Card at the top */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white shadow-sm bg-slate-50">
                    {getProfilePhotoUrl(user.profilePhoto || user.profileImage) ? (
                      <img src={getProfilePhotoUrl(user.profilePhoto || user.profileImage)} alt={user.name} className="h-full w-full object-cover" onError={handleProfileImageError} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-left leading-tight">
                    <p className="font-extrabold text-sm text-slate-800">{user.name}</p>
                    <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border mt-1 ${roleBadgeStyle}`}>
                      {roleLabel}
                    </span>
                    {user.emailVerified ? (
                      <span className="inline-flex items-center text-[9px] font-extrabold px-2 py-0.5 rounded-full border mt-1 ml-1 bg-emerald-50 border-emerald-100 text-emerald-600">
                        ✓ Verified
                      </span>
                    ) : (
                      <Link 
                        to="/verify-email" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex items-center text-[9px] font-extrabold px-2 py-0.5 rounded-full border mt-1 ml-1 bg-rose-50 border-rose-100 text-rose-600 hover:scale-105 transition-all"
                      >
                        ⚠ Verify Email
                      </Link>
                    )}
                  </div>
                </div>

                {/* List of navigational elements */}
                <div className="space-y-1">
                  
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-slate-700 hover:text-brand-500 font-bold p-3 rounded-xl hover:bg-brand-50/50 transition-all text-sm"
                  >
                    <User size={20} className="text-brand-500" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to={isTeacher ? '/teacher' : '/student'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-slate-700 hover:text-brand-500 font-bold p-3 rounded-xl hover:bg-brand-50/50 transition-all text-sm"
                  >
                    <Shield size={20} className="text-brand-500" />
                    <span>Dashboard</span>
                  </Link>

                  {isTeacher ? (
                    <>
                      <Link
                        to="/teacher?tab=students"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-slate-700 hover:text-[#f97316] font-bold p-3 rounded-xl hover:bg-orange-50/30 transition-all text-sm"
                      >
                        <Users size={20} className="text-[#f97316]" />
                        <span>My Students</span>
                      </Link>

                      <Link
                        to="/teacher?tab=requests"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-slate-700 hover:text-[#f97316] font-bold p-3 rounded-xl hover:bg-orange-50/30 transition-all text-sm"
                      >
                        <UserPlus size={20} className="text-[#f97316]" />
                        <span>Pending Requests</span>
                      </Link>

                      <Link
                        to="/teacher?tab=attendance"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-slate-700 hover:text-[#f97316] font-bold p-3 rounded-xl hover:bg-orange-50/30 transition-all text-sm"
                      >
                        <ClipboardCheck size={20} className="text-[#f97316]" />
                        <span>Attendance</span>
                      </Link>

                      <Link
                        to="/teacher?tab=fees"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-slate-700 hover:text-[#f97316] font-bold p-3 rounded-xl hover:bg-orange-50/30 transition-all text-sm"
                      >
                        <DollarSign size={20} className="text-[#f97316]" />
                        <span>Fee Management</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/student?tab=favorites"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-slate-700 hover:text-brand-500 font-bold p-3 rounded-xl hover:bg-brand-50/50 transition-all text-sm"
                      >
                        <Heart size={20} className="text-brand-500" />
                        <span>Saved Teachers</span>
                      </Link>

                      <Link
                        to="/student?tab=requests"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-slate-700 hover:text-brand-500 font-bold p-3 rounded-xl hover:bg-brand-50/50 transition-all text-sm"
                      >
                        <MessageSquare size={20} className="text-brand-500" />
                        <span>My Requests</span>
                      </Link>

                      <Link
                        to="/student?tab=billing"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 text-slate-700 hover:text-brand-500 font-bold p-3 rounded-xl hover:bg-brand-50/50 transition-all text-sm"
                      >
                        <DollarSign size={20} className="text-brand-500" />
                        <span>Fees & Receipts</span>
                      </Link>
                    </>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-slate-700 hover:text-brand-500 font-bold p-3 rounded-xl hover:bg-brand-50/50 transition-all text-sm"
                  >
                    <Settings size={20} className="text-brand-500" />
                    <span>Settings</span>
                  </Link>

                </div>

                <div className="border-t border-slate-100 my-2 pt-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center space-x-3 text-rose-600 font-bold p-3 rounded-xl hover:bg-rose-50 transition-all text-sm cursor-pointer border border-transparent"
                >
                  <LogOut size={20} />
                  <span>{t('nav.logout') || 'Logout'}</span>
                </button>

              </div>
            ) : (
              /* Mobile menu items for non-logged in users */
              <div className="space-y-4 pt-2">
                <Link
                  to="/nearby"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center border border-slate-200 text-slate-700 font-bold p-3 rounded-xl hover:bg-slate-50 transition-all text-xs"
                >
                  🔍 Find Tuition Tutors
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login/student"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center border border-slate-200 text-slate-700 font-bold p-3 rounded-xl hover:bg-slate-50 transition-all text-xs"
                  >
                    🎒 Student Login
                  </Link>
                  <Link
                    to="/login/teacher"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center border border-slate-200 text-slate-700 font-bold p-3 rounded-xl hover:bg-slate-50 transition-all text-xs"
                  >
                    🎓 Teacher Login
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/signup/student"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center bg-brand-500 text-white font-bold p-3 rounded-xl transition-all text-xs"
                  >
                    🎒 Sign Up as Student / Parent
                  </Link>
                  <Link
                    to="/signup/teacher"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center bg-orange-500 text-white font-bold p-3 rounded-xl transition-all text-xs"
                  >
                    🎓 Sign Up as Teacher
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
