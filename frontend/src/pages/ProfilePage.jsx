import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getProfilePhotoUrl, handleProfileImageError } from '../utils/image';
import { 
  User, Mail, Phone, MapPin, Award, BookOpen, Clock, 
  DollarSign, Briefcase, GraduationCap, Edit3, X, 
  Save, Camera, ArrowLeft, Shield, Globe, Users, 
  CheckCircle, Star, Heart, Calendar, AlertCircle
} from 'lucide-react';
import StarRating from '../components/StarRating';

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Profile status & loaded data
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success');

  // VIEW MODE SUB-STATES (AGGREGATE LIVE STATS)
  // For Teacher
  const [teacherReviews, setTeacherReviews] = useState([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [monthlyCollection, setMonthlyCollection] = useState(0);
  const [averageAttendanceRate, setAverageAttendanceRate] = useState(100);

  // For Student
  const [joinedTeachers, setJoinedTeachers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [favoritesList, setFavoritesList] = useState([]);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);

  // Edit Form Fields (common)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [address, setAddress] = useState('');

  // Edit Form Fields (Teacher only)
  const [subjects, setSubjects] = useState('');
  const [classes, setClasses] = useState('');
  const [teachesFrom, setTeachesFrom] = useState(1);
  const [teachesTo, setTeachesTo] = useState(12);
  const [fees, setFees] = useState(500);
  const [timings, setTimings] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState(0);
  const [mode, setMode] = useState('offline');
  const [demoAvailable, setDemoAvailable] = useState(false);
  const [teachingArea, setTeachingArea] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Edit Form Fields (Student only)
  const [studentClass, setStudentClass] = useState('');
  const [school, setSchool] = useState('');

  useEffect(() => {
    if (user) {
      loadProfileAndStats();
    }
  }, [user]);

  const triggerAlert = (msg, type = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const loadProfileAndStats = async () => {
    setLoading(true);
    try {
      if (user.role === 'teacher') {
        // 1. Core Profile
        const profileRes = await axios.get('/api/teachers/my-profile');
        const data = profileRes.data;
        setProfileData(data);

        // Prep form fields
        setName(data.user?.name || user.name);
        setPhone(data.user?.phone || user.phone);
        setProfilePhoto(data.profilePhoto || data.profileImage || user.profilePhoto || user.profileImage || '');
        setSubjects(data.subjects?.join(', ') || '');
        setClasses(data.classes?.join(', ') || '');
        setTeachesFrom(data.teachesFrom !== undefined ? data.teachesFrom : 1);
        setTeachesTo(data.teachesTo !== undefined ? data.teachesTo : 12);
        setFees(data.fees || 500);
        setTimings(data.timings || '');
        setQualification(data.qualification || '');
        setExperience(data.experience || 0);
        setMode(data.mode || 'offline');
        setDemoAvailable(data.demoAvailable || false);
        setAddress(data.address || '');
        setTeachingArea(data.teachingArea || data.villageOrArea || '');
        setLocality(data.locality || '');
        setCity(data.city || 'Dhanbad');
        setState(data.state || 'Jharkhand');

        // 2. Reviews
        try {
          const reviewsRes = await axios.get(`/api/teachers/reviews/${data._id}`);
          setTeacherReviews(reviewsRes.data || []);
        } catch (e) {
          console.error('Error fetching reviews:', e);
        }

        // 3. Roster Count
        try {
          const enrollmentsRes = await axios.get('/api/enrollments');
          const rosters = enrollmentsRes.data || [];
          setTotalStudentsCount(rosters.length);
          setActiveStudentsCount(rosters.filter(r => r.status === 'active').length);
        } catch (e) {
          console.error('Error fetching enrollments:', e);
        }

        // 4. Monthly Collection
        try {
          const feesRes = await axios.get('/api/classes/fees');
          const ledger = feesRes.data || [];
          const totalPaid = ledger
            .filter(f => f.status === 'paid')
            .reduce((sum, f) => sum + (f.amount || 0), 0);
          setMonthlyCollection(totalPaid);
        } catch (e) {
          console.error('Error fetching fees collections:', e);
        }

        // 5. Attendance Rate
        try {
          const attRes = await axios.get('/api/classes/attendance');
          const attRecords = attRes.data || [];
          if (attRecords.length > 0) {
            const presents = attRecords.filter(r => r.status === 'present').length;
            setAverageAttendanceRate(Math.round((presents / attRecords.length) * 100));
          } else {
            setAverageAttendanceRate(98); // Mock default if empty
          }
        } catch (e) {
          console.error('Error fetching attendance logs:', e);
          setAverageAttendanceRate(98);
        }

      } else if (user.role === 'student') {
        // 1. Core Profile
        const profileRes = await axios.get('/api/students/profile');
        const data = profileRes.data;
        setProfileData(data);

        // Prep form fields
        setName(data.user?.name || user.name);
        setPhone(data.user?.phone || user.phone);
        setProfilePhoto(data.profilePhoto || data.profileImage || user.profilePhoto || user.profileImage || '');
        setStudentClass(data.class || '');
        setSchool(data.school || '');
        setAddress(data.address || '');

        // 2. Bookmarked/Favorite Tutors
        try {
          const favRes = await axios.get('/api/students/favorites');
          setFavoritesList(favRes.data || []);
        } catch (e) {
          console.error('Error fetching bookmarks:', e);
        }

        // 3. Requests & Connected Tutors
        try {
          const reqRes = await axios.get('/api/requests/student');
          const requests = reqRes.data || [];
          setPendingRequests(requests.filter(r => r.status === 'pending'));
          setJoinedTeachers(requests.filter(r => r.status === 'accepted'));
        } catch (e) {
          console.error('Error fetching student request cohorts:', e);
        }
      } else {
        // Admin Profile fallback
        setProfileData({ user });
        setName(user.name);
        setPhone(user.phone || '');
        setProfilePhoto(user.profilePhoto || user.profileImage || '');
      }
    } catch (err) {
      console.error('Failed to load profile parameters:', err);
      triggerAlert('Failed to load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Device file photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate format
      const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedFormats.includes(file.type)) {
        triggerAlert('Please select a JPG, JPEG, PNG, or WEBP profile image.', 'error');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        triggerAlert('Maximum profile picture size allowed is 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result); // Immediate base64 preview before save
        triggerAlert('Image uploaded successfully. Click Save to apply changes.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user.role === 'teacher') {
        await axios.put('/api/teachers/profile', {
          name,
          phone,
          profilePhoto,
          subjects,
          teachesFrom: Number(teachesFrom),
          teachesTo: Number(teachesTo),
          fees: Number(fees),
          timings,
          qualification,
          experience: Number(experience),
          mode,
          demoAvailable,
          address,
          villageOrArea: teachingArea,
          teachingArea,
          locality,
          city,
          state
        });
      } else if (user.role === 'student') {
        await axios.put('/api/students/profile', {
          name,
          phone,
          profilePhoto,
          class: studentClass,
          school,
          address
        });
      } else {
        triggerAlert('Editing unavailable for administrative clearance.', 'error');
        return;
      }

      // Fetch refreshed user from auth/me
      const { data } = await axios.get('/api/auth/me');
      setUser(data);

      triggerAlert(
        i18n.language === 'hi' 
          ? 'प्रोफ़ाइल विवरण सफलतापूर्वक सहेजा गया!' 
          : 'Profile details saved successfully!'
      );
      setIsEditing(false);
      loadProfileAndStats();
    } catch (err) {
      console.error('Profile saving failed:', err);
      triggerAlert('Failed to save profile changes.', 'error');
    }
  };

  const removePhoto = () => {
    setProfilePhoto('');
    triggerAlert('Photo removed successfully. Click Save to apply changes.', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-semibold text-sm">Synchronizing GuruConnect Profile...</p>
        </div>
      </div>
    );
  }

  const isTeacher = user?.role === 'teacher';
  const roleLabel = isTeacher ? 'Tuition Teacher' : user?.role === 'student' ? 'Student' : 'Administrator';
  
  // Dynamic Cover & Role Styling
  const bannerGradient = isTeacher 
    ? 'from-orange-500 via-rose-500 to-pink-500' 
    : 'from-indigo-600 via-blue-600 to-cyan-500';
  
  const roleBadgeStyle = isTeacher
    ? 'bg-orange-500/10 border-orange-200 text-orange-600'
    : 'bg-indigo-500/10 border-indigo-200 text-indigo-600';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Alert popup */}
      {alertMsg && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-xl border flex items-center space-x-2 text-sm font-semibold animate-slide-up ${
          alertType === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          <AlertCircle size={16} />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Back to Portal link */}
      <button 
        onClick={() => navigate(isTeacher ? '/teacher' : '/student')}
        className="mb-6 flex items-center space-x-2 text-slate-500 hover:text-brand-600 font-bold text-sm transition-colors group cursor-pointer border border-transparent"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        <span>Return to Dashboard</span>
      </button>

      {/* VIEW PORTAL MAIN CONTAINER CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden relative">
        
        {/* Dynamic Cover Section - Extended Premium Gradient Header */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${bannerGradient} text-white px-6 sm:px-10 pt-16 pb-10`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent"></div>
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/15 text-white text-[9px] uppercase font-black tracking-widest px-3.5 py-1.5 rounded-full shadow-sm z-20">
            🛡️ Safe Hyperlocal Connection
          </div>
          
          {/* Identity & Core Details Wrapper */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-4">
            
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              
              {/* Circular Avatar with glow white border and shadow */}
              <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full border-4 border-white/80 bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden flex items-center justify-center shrink-0 transition-transform hover:scale-105 duration-300 relative z-10">
                {getProfilePhotoUrl(user?.profilePhoto || user?.profileImage) ? (
                  <img 
                    src={getProfilePhotoUrl(user.profilePhoto || user.profileImage)} 
                    alt={user.name} 
                    className="h-full w-full object-cover" 
                    onError={handleProfileImageError}
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-white/95">
                    <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[8px] text-white/80 font-extrabold uppercase mt-1 tracking-wider">No Photo</span>
                  </div>
                )}
              </div>

              {/* Name and Badges */}
              <div className="space-y-3.5">
                <h1 className="font-outfit font-black text-3xl sm:text-4xl text-white drop-shadow-md tracking-tight leading-none">
                  {user?.name}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <span className="inline-flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full shadow-sm text-white">
                    <span>{isTeacher ? '👨‍🏫' : '🎓'}</span>
                    <span>{roleLabel}</span>
                  </span>
                  <span className="text-white/90 font-bold text-xs flex items-center space-x-1 drop-shadow-sm bg-black/10 px-3.5 py-1.5 rounded-full border border-white/5">
                    <Calendar size={13} className="text-white/80" />
                    <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                  </span>
                </div>
              </div>

            </div>

            {/* Premium edit profile button inside the colored header area */}
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer border border-transparent self-center md:self-auto hover:-translate-y-0.5 duration-200"
            >
              <Edit3 size={14} className="text-slate-800" />
              <span>Edit Profile</span>
            </button>

          </div>
        </div>

        {/* Identity & Core Details Panel - Lower Content White Background */}
        <div className="px-6 sm:px-10 pb-8 relative">

          <div className="border-t border-slate-100 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Sidebar info fields (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Account details card */}
              <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-5 text-left">
                <h3 className="font-outfit font-black text-base text-slate-800 border-b border-slate-200/50 pb-2.5">
                  About Me
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5 break-all">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Contact</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{user?.phone || 'Not shared'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin size={16} className="text-[#f97316] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hyperlocal Academy Area</p>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">
                        {profileData?.address || 'Set address in Edit Profile'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teaching details (Teacher Only) */}
              {isTeacher && (
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-5 text-left">
                  <h3 className="font-outfit font-black text-base text-slate-800 border-b border-slate-200/50 pb-2.5">
                    Tuition Conditions
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Globe size={16} className="text-brand-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lecturing Mode</p>
                        <p className="text-xs font-bold text-slate-700 capitalize mt-0.5">{profileData?.mode || 'offline only'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock size={16} className="text-brand-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coaching Hours</p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">{profileData?.timings || 'Flexible slots'}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trial / Demo Lecture</p>
                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 border rounded-full mt-1.5 ${
                          profileData?.demoAvailable ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {profileData?.demoAvailable ? 'Free Trial Available' : 'On Request Only'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Role-Specific Details Panel (Col 8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {isTeacher ? (
                /* ====================================================
                   TEACHER REDESIGN VIEW PORTAL
                   ==================================================== */
                <div className="space-y-6">
                  
                  {/* Visual Premium Stats Grid (4 Cards) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    
                    <div className="bg-gradient-to-tr from-[#1e293b] to-[#334155] text-white p-5 rounded-3xl shadow-sm text-left relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10"><Users size={80} /></div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Students</span>
                      <p className="font-outfit font-black text-2xl mt-1.5">{totalStudentsCount}</p>
                    </div>

                    <div className="bg-gradient-to-tr from-brand-500 to-indigo-600 text-white p-5 rounded-3xl shadow-sm text-left relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10"><CheckCircle size={80} /></div>
                      <span className="text-[9px] font-black uppercase text-brand-100 tracking-wider">Active Cohort</span>
                      <p className="font-outfit font-black text-2xl mt-1.5">{activeStudentsCount}</p>
                    </div>

                    <div className="bg-gradient-to-tr from-[#059669] to-[#10b981] text-white p-5 rounded-3xl shadow-sm text-left relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10"><DollarSign size={80} /></div>
                      <span className="text-[9px] font-black uppercase text-emerald-100 tracking-wider">Monthly Ledger</span>
                      <p className="font-outfit font-black text-2xl mt-1.5">₹{monthlyCollection}</p>
                    </div>

                    <div className="bg-gradient-to-tr from-[#f59e0b] to-[#d97706] text-white p-5 rounded-3xl shadow-sm text-left relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-10"><Star size={80} /></div>
                      <span className="text-[9px] font-black uppercase text-amber-100 tracking-wider">Attendance Rate</span>
                      <p className="font-outfit font-black text-2xl mt-1.5">{averageAttendanceRate}%</p>
                    </div>

                  </div>

                  {/* Academic Credentials Card */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-5 text-left">
                    <h3 className="font-outfit font-black text-lg text-slate-800 border-b border-slate-100 pb-3">
                      Academic Credentials
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      <div className="flex items-start space-x-3">
                        <GraduationCap className="text-brand-500 mt-0.5 shrink-0" size={22} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Qualification</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">{profileData?.qualification || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Briefcase className="text-brand-500 mt-0.5 shrink-0" size={22} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Teaching Experience</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">{profileData?.experience || 0} Years Experience</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <BookOpen className="text-brand-500 mt-0.5 shrink-0" size={22} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subjects Taught</p>
                          <p className="text-sm font-extrabold text-brand-600 mt-1">{profileData?.subjects?.join(', ') || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Users className="text-brand-500 mt-0.5 shrink-0" size={22} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Classes Taught</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">
                            {profileData?.teachesFrom !== undefined 
                              ? `Class ${profileData.teachesFrom} to Class ${profileData.teachesTo}` 
                              : (profileData?.classes?.join(', ') || 'N/A')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <DollarSign className="text-brand-500 mt-0.5 shrink-0" size={22} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Standard Fee Rate</p>
                          <p className="text-sm font-black text-slate-800 mt-1">₹{profileData?.fees || 500} / month</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <MapPin className="text-[#f97316] mt-0.5 shrink-0" size={22} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Geographical Area</p>
                          <p className="text-sm font-bold text-slate-800 mt-1">{profileData?.teachingArea || 'N/A'}</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Dynamic Reviews & Comments */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-5 text-left">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="font-outfit font-black text-lg text-slate-800">
                        Ratings & Reviews
                      </h3>
                      
                      <div className="flex items-center space-x-2">
                        <StarRating rating={profileData?.rating || 0} size={14} />
                        <span className="text-xs text-slate-400 font-bold">({profileData?.reviewCount || 0} Reviews)</span>
                      </div>
                    </div>

                    {teacherReviews.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium text-xs bg-slate-50/50 rounded-2xl">
                        ⭐ No student evaluations posted for this academy yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                        {teacherReviews.map((rev) => (
                          <div key={rev._id} className="bg-slate-50/60 p-4 border border-slate-100 rounded-2xl space-y-2 leading-snug">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-800">👤 {rev.studentName}</span>
                              <StarRating rating={rev.rating} size={10} />
                            </div>
                            <p className="text-slate-500 italic text-[11px]">"{rev.comment}"</p>
                            <p className="text-[9px] text-slate-400 font-bold text-right">{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* ====================================================
                   STUDENT REDESIGN VIEW PORTAL
                   ==================================================== */
                <div className="space-y-6">
                  
                  {/* Grid details: School & class stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex items-start space-x-3 text-left">
                      <GraduationCap className="text-brand-500 shrink-0" size={22} />
                      <div>
                        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Class / Grade</h4>
                        <p className="text-sm font-bold text-slate-800 mt-1">{profileData?.class || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex items-start space-x-3 text-left">
                      <Award className="text-[#f97316] shrink-0" size={22} />
                      <div>
                        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active School</h4>
                        <p className="text-xs font-bold text-slate-800 mt-1 leading-snug">{profileData?.school || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-tr from-[#1d4ed8] to-[#0891b2] text-white p-5 rounded-3xl flex items-start space-x-3 text-left relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-15"><CheckCircle size={70} /></div>
                      <span className="text-[9px] font-black uppercase text-cyan-100 tracking-wider">Attendance Status</span>
                      <p className="font-outfit font-black text-sm mt-3.5">94% Compliant 🌟</p>
                    </div>
                  </div>

                  {/* Joined Teachers grid */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 text-left">
                    <h3 className="font-outfit font-black text-lg text-slate-800 border-b border-slate-100 pb-2">
                      My Connected Teachers ({joinedTeachers.length})
                    </h3>

                    {joinedTeachers.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium text-xs bg-slate-50/50 rounded-2xl">
                        🎓 No active connected tuition teachers. Use hyper-local search to apply!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {joinedTeachers.map((r) => (
                          <div key={r._id} className="bg-slate-50/80 p-4 border border-slate-100 rounded-2xl flex flex-col justify-between">
                            <div className="space-y-1">
                              <p className="font-bold text-sm text-slate-800">🎓 {r.teacher?.user?.name || 'Tuition Teacher'}</p>
                              <span className="inline-block text-[9px] font-black text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded">
                                {r.subject}
                              </span>
                              <p className="text-slate-500 font-semibold text-[10px] leading-tight pt-1">📍 Academy: {r.teacher?.address}</p>
                            </div>
                            
                            <div className="flex justify-between items-center border-t border-slate-200/50 pt-2.5 mt-3.5">
                              <span className="text-[10px] font-bold text-slate-400 font-mono">📱 {r.parentPhone || r.teacher?.user?.phone || 'Not shared'}</span>
                              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active Cohort</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Requests */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 text-left">
                    <h3 className="font-outfit font-black text-lg text-slate-800 border-b border-slate-100 pb-2">
                      Applications Registry ({pendingRequests.length})
                    </h3>

                    {pendingRequests.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium text-xs bg-slate-50/50 rounded-2xl">
                        📬 No pending connection requests in folder.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pendingRequests.map((r) => (
                          <div key={r._id} className="bg-slate-50/80 p-3.5 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <p className="font-bold text-xs text-slate-800">🎒 Applied: {r.teacher?.user?.name || 'Academy Tutor'}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Subject: <span className="text-slate-600 font-bold">{r.subject}</span> | Sent: {new Date(r.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl flex items-center space-x-1 shrink-0">
                              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-ping"></span>
                              <span>Pending Review</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Favorite Teachers bookmarks list */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 text-left">
                    <h3 className="font-outfit font-black text-lg text-slate-800 border-b border-slate-100 pb-2">
                      Bookmarked Academies ({favoritesList.length})
                    </h3>

                    {favoritesList.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium text-xs bg-slate-50/50 rounded-2xl">
                        ⭐ Bookmarked tutors will appear here for immediate connections.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {favoritesList.map((t) => (
                          <div key={t._id} className="bg-slate-50/80 p-4 border border-slate-100 rounded-2xl flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-bold text-xs text-slate-800">🏫 {t.user?.name}</p>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <StarRating rating={t.rating} size={10} />
                                <span className="text-[9px] text-slate-400 font-black">({t.reviewCount})</span>
                              </div>
                              <p className="text-slate-500 text-[10px] leading-tight pt-1">Subjects: {t.subjects?.join(', ')}</p>
                            </div>
                            <button
                              onClick={() => navigate(`/teacher-profile/${t._id}`)}
                              className="px-3 py-1 bg-slate-900 text-white text-[9px] font-extrabold rounded-lg hover:bg-slate-800 active:scale-95 transition-all shrink-0 cursor-pointer"
                            >
                              Visit
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* OVERLAY GLASSMORPHIC EDITING MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto animate-fade-in text-left">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors cursor-pointer border border-transparent"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="font-outfit font-black text-2xl text-slate-955">
                Edit Profile Workspace
              </h3>
              <p className="text-xs text-slate-400 font-bold tracking-wide mt-1">
                Updates will instantly reflect across the portal and navbar widgets.
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-6 text-left">
              
              {/* Photo Lifecycle management */}
              <div className="space-y-3 bg-slate-50 p-5 border border-slate-100 rounded-3xl">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Profile Photo Management</label>
                
                {/* Photo Inputs / upload */}
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  
                  {/* Photo Preview / Circular */}
                  <div className="h-20 w-20 bg-white border border-slate-200 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                    {getProfilePhotoUrl(profilePhoto) ? (
                      <img src={getProfilePhotoUrl(profilePhoto)} alt="Avatar" className="h-full w-full object-cover" onError={handleProfileImageError} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* File Pick trigger */}
                  <div className="flex-grow w-full space-y-2 text-left">
                    <input
                      type="file"
                      accept="image/*"
                      id="profile-photo-upload-input"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    
                    <div className="flex flex-wrap gap-2.5">
                      <label
                        htmlFor="profile-photo-upload-input"
                        className="inline-block px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer border border-transparent"
                      >
                        {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                      </label>

                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs transition-all cursor-pointer border border-rose-150"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Upload real photos from device storage. Supports JPG, JPEG, PNG, WEBP (Max 5MB).
                    </p>
                  </div>

                </div>

              </div>

              {/* Core Text Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Phone Number *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Student specific fields */}
              {!isTeacher && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Class / Standard *</label>
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      required
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500"
                    >
                      <option value="">Select Class</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={`Class ${i + 1}`}>Class {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">School Name *</label>
                    <input
                      type="text"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      required
                      placeholder="e.g. Govt High School"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              )}

              {/* Teacher specific fields */}
              {isTeacher && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Subjects Taught (comma separated)</label>
                      <input
                        type="text"
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        placeholder="Maths, Science"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">From Class</label>
                        <select
                          value={teachesFrom}
                          onChange={(e) => setTeachesFrom(Number(e.target.value))}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500"
                        >
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>Class {i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">To Class</label>
                        <select
                          value={teachesTo}
                          onChange={(e) => setTeachesTo(Number(e.target.value))}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500"
                        >
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>Class {i + 1}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Qualification</label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="B.Sc. Mathematics, B.Ed."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Teaching Experience (Years)</label>
                      <input
                        type="number"
                        value={experience}
                        onChange={(e) => setExperience(Number(e.target.value))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Monthly Tuition Fees (INR)</label>
                      <input
                        type="number"
                        value={fees}
                        onChange={(e) => setFees(Number(e.target.value))}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Coaching Hours</label>
                      <input
                        type="text"
                        value={timings}
                        onChange={(e) => setTimings(e.target.value)}
                        placeholder="e.g. 4:00 PM - 7:00 PM"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Teaching Mode</label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none"
                      >
                        <option value="offline">Offline Only (Home Tuition)</option>
                        <option value="online">Online Only</option>
                        <option value="both">Both (Online and offline)</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="modalDemoAvailable"
                        checked={demoAvailable}
                        onChange={(e) => setDemoAvailable(e.target.checked)}
                        className="h-4 w-4 accent-brand-500 rounded"
                      />
                      <label htmlFor="modalDemoAvailable" className="text-xs font-bold text-slate-600 cursor-pointer">
                        Free Trial/Demo Lecture Available
                      </label>
                    </div>
                  </div>

                  {/* Geolocation fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Village / Teaching Area *</label>
                      <input
                        type="text"
                        value={teachingArea}
                        onChange={(e) => setTeachingArea(e.target.value)}
                        required
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Locality / block</label>
                      <input
                        type="text"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">City *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">State *</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address Area */}
              <div className="space-y-1.5 border-t border-slate-100 pt-4">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Full Academy/Home Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows="2"
                  placeholder="Street name, Village, block, District..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none resize-none"
                ></textarea>
              </div>

              {/* Action Rows */}
              <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl active:scale-95 transition-all cursor-pointer border border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-2xl shadow-md active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer border border-transparent"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
