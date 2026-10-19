import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Star, MapPin, Award, Trash2, Save, BookOpen, GraduationCap, AlertCircle, Clock, Check, X,
  ExternalLink, Phone, Download, MessageSquare, Calendar, Bell, FileText, Sparkles, Search,
  Copy, Plus, Info, Percent, ChevronRight, Bot, UserPlus, ClipboardCheck, DollarSign, Globe
} from 'lucide-react';
import StarRating from '../components/StarRating';
import { downloadReceiptPdf } from '../utils/receiptPdf';
import { getProfilePhotoUrl, handleProfileImageError } from '../utils/image';
import GuruAIHub from '../components/GuruAI/GuruAIHub';
import LearningPreferencesModal from '../components/GuruAI/LearningPreferencesModal';

const StudentDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Student Profile fields
  const [studentClass, setStudentClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [curriculum, setCurriculum] = useState('CBSE');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [showPreferencesPrompt, setShowPreferencesPrompt] = useState(false);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [school, setSchool] = useState('');
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [joinedTeachers, setJoinedTeachers] = useState([]);

  // Favorites state
  const [favorites, setFavorites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState('');
  const [billingHistory, setBillingHistory] = useState([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Main navigation tab
  const [mainTab, setMainTab] = useState('classroom'); // 'classroom', 'explore', 'billing'

  // Teacher lookup & claim states
  const [teacherCodeInput, setTeacherCodeInput] = useState('');
  const [lookedUpTeacher, setLookedUpTeacher] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [claimableRecord, setClaimableRecord] = useState(null);
  const [isSubmittingConnect, setIsSubmittingConnect] = useState(false);

  // Classroom sub-views state
  const [classroomActiveTab, setClassroomActiveTab] = useState('announcements'); // 'announcements', 'homework', 'notes', 'doubts', 'attendance'
  const [studentNotes, setStudentNotes] = useState([]);
  const [studentHomeworks, setStudentHomeworks] = useState([]);
  const [studentAnnouncements, setStudentAnnouncements] = useState([]);
  const [studentDoubts, setStudentDoubts] = useState([]);
  const [newDoubtQuestion, setNewDoubtQuestion] = useState('');
  const [doubtTargetTeacher, setDoubtTargetTeacher] = useState('');
  const [attendanceMetrics, setAttendanceMetrics] = useState({ totalDays: 0, presentDays: 0, absentDays: 0, percentage: 100 });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);
  const [dashboardNotifications, setDashboardNotifications] = useState([]);

  const fetchDashboardNotifications = async () => {
    try {
      const { data } = await axios.get('/api/notifications');
      setDashboardNotifications(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudentProfile();
    fetchFavorites();
    fetchRequests();
    fetchBillingHistory();
    fetchClassroomData();
    fetchDashboardNotifications();

    // Deep-linking based on search query params
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      if (tabParam === 'ai' || tabParam === 'guruai') {
        setMainTab('ai');
      } else if (tabParam === 'classroom') {
        setMainTab('classroom');
      } else if (tabParam === 'billing' || tabParam === 'fees') {
        setMainTab('billing');
      } else if (tabParam === 'explore' || tabParam === 'favorites' || tabParam === 'requests') {
        setMainTab('explore');
      }

      setTimeout(() => {
        const element = document.getElementById(`${tabParam}-section`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 400);
    }
  }, [window.location.search]);

  const fetchStudentProfile = async () => {
    try {
      const { data } = await axios.get('/api/students/profile');
      if (data) {
        setStudentClass(data.class || '');
        setSubjects(data.subjects || []);
        setCurriculum(data.curriculum || 'CBSE');
        setPreferredLanguage(data.preferredLanguage || 'English');
        setSchool(data.school || '');
        setAddress(data.address || '');
        setName(data.user?.name || '');
        setPhone(data.user?.phone || '');
        setJoinedTeachers(data.joinedTeachers || []);
        
        // Show lightweight setup prompt if essential learning preferences are missing
        if (!data.class || !data.subjects || data.subjects.length === 0) {
          setShowPreferencesPrompt(true);
        } else {
          setShowPreferencesPrompt(false);
        }

        // Auto-select first teacher for doubts
        const validTeachers = (data.joinedTeachers || []).filter(t => t && t._id);
        if (validTeachers.length > 0 && !doubtTargetTeacher) {
          setDoubtTargetTeacher(validTeachers[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getUnsupportedTeachers = () => {
    if (!studentClass || !joinedTeachers) return [];
    const match = studentClass.match(/\d+/);
    if (!match) return [];
    const studentClassNum = parseInt(match[0], 10);
    
    return joinedTeachers.filter(teacher => {
      if (!teacher || typeof teacher !== 'object') return false;
      const from = teacher.teachesFrom !== undefined ? teacher.teachesFrom : 1;
      const to = teacher.teachesTo !== undefined ? teacher.teachesTo : 12;
      return studentClassNum < from || studentClassNum > to;
    });
  };

  const unsupportedTeachers = getUnsupportedTeachers();

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/students/favorites');
      setFavorites(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get('/api/requests/student');
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to retrieve student requests:', err);
    }
  };

  const fetchBillingHistory = async () => {
    try {
      const { data } = await axios.get('/api/students/fees');
      setBillingHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch billing history:', err);
    }
  };

  const fetchClassroomData = async () => {
    try {
      const [notesRes, hwRes, announceRes, doubtsRes, attendanceRes] = await Promise.all([
        axios.get('/api/classroom/notes/student'),
        axios.get('/api/classroom/homework/student'),
        axios.get('/api/classroom/announcements/student'),
        axios.get('/api/classroom/doubts/student'),
        axios.get('/api/classroom/attendance/student')
      ]);

      setStudentNotes(notesRes.data || []);
      setStudentHomeworks(hwRes.data || []);
      setStudentAnnouncements(announceRes.data || []);
      setStudentDoubts(doubtsRes.data || []);
      
      if (attendanceRes.data) {
        setAttendanceMetrics(attendanceRes.data.metrics || { totalDays: 0, presentDays: 0, absentDays: 0, percentage: 100 });
        setAttendanceHistory(attendanceRes.data.history || []);
      }
    } catch (err) {
      console.error('Error fetching student classroom content:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/students/profile', {
        name,
        phone,
        class: studentClass,
        subjects,
        curriculum,
        preferredLanguage,
        school,
        address
      });
      triggerAlert('Profile updated successfully!');
      fetchStudentProfile();
    } catch (err) {
      triggerAlert('Failed to update student profile.', 'error');
    }
  };

  // Connection lookup
  const handleTeacherLookup = async (e) => {
    e.preventDefault();
    if (!teacherCodeInput.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookedUpTeacher(null);
    setClaimableRecord(null);

    try {
      const { data } = await axios.get(`/api/connections/lookup/${teacherCodeInput.trim()}`);
      console.log('[DEBUG FRONTEND] Teacher Lookup Response:', data);
      console.log('[DEBUG FRONTEND] profileImage value:', data.profileImage);
      setLookedUpTeacher(data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message?.[i18n.language] || err.response?.data?.message?.en || 'Could not find teacher with this connection code.';
      setLookupError(msg);
    } finally {
      setLookupLoading(false);
    }
  };

  // Send connect request
  const handleConnect = async () => {
    if (!lookedUpTeacher) return;
    setIsSubmittingConnect(true);
    try {
      const { data } = await axios.post('/api/connections/connect', {
        code: teacherCodeInput.trim()
      });

      if (data.matchFound) {
        setClaimableRecord({
          enrollment: data.enrollment,
          teacherId: data.teacherId,
          message: data.message?.[i18n.language] || data.message?.en
        });
        triggerAlert(i18n.language === 'hi' ? 'स्मार्ट-मैच रिकॉर्ड मिला! दावा करने के लिए नीचे टैप करें।' : 'Record matched! Claim your seat below.');
      } else {
        triggerAlert(data.message?.[i18n.language] || data.message?.en || 'Connection request sent successfully!');
        fetchRequests();
        setLookedUpTeacher(null);
        setTeacherCodeInput('');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message?.[i18n.language] || err.response?.data?.message?.en || 'Failed to request connection.';
      triggerAlert(msg, 'error');
    } finally {
      setIsSubmittingConnect(false);
    }
  };

  // Claim offline record
  const handleClaim = async () => {
    if (!claimableRecord) return;
    setIsSubmittingConnect(true);
    try {
      const { data } = await axios.post('/api/connections/claim', {
        enrollmentId: claimableRecord.enrollment._id,
        teacherId: claimableRecord.teacherId
      });

      triggerAlert(data.message?.[i18n.language] || data.message?.en || 'Successfully connected and tuition synced!');
      setClaimableRecord(null);
      setLookedUpTeacher(null);
      setTeacherCodeInput('');
      
      // Reload everything
      fetchStudentProfile();
      fetchRequests();
      fetchBillingHistory();
      fetchClassroomData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message?.[i18n.language] || err.response?.data?.message?.en || 'Failed to claim offline record.';
      triggerAlert(msg, 'error');
    } finally {
      setIsSubmittingConnect(false);
    }
  };

  // Ask new doubt
  const handleAskDoubt = async (e) => {
    e.preventDefault();
    if (!newDoubtQuestion.trim()) return;
    if (!doubtTargetTeacher) {
      triggerAlert(i18n.language === 'hi' ? 'शंका पूछने के लिए कृपया एक शिक्षक चुनें।' : 'Please select a teacher to ask your doubt.', 'error');
      return;
    }

    setIsSubmittingDoubt(true);
    try {
      await axios.post('/api/classroom/doubts', {
        teacherId: doubtTargetTeacher,
        question: newDoubtQuestion.trim()
      });

      triggerAlert(i18n.language === 'hi' ? 'आपकी शंका सफलतापूर्वक सबमिट हो गई!' : 'Doubt submitted successfully!');
      setNewDoubtQuestion('');
      
      // Reload doubts list
      const doubtsRes = await axios.get('/api/classroom/doubts/student');
      setStudentDoubts(doubtsRes.data || []);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message?.[i18n.language] || err.response?.data?.message?.en || 'Failed to submit doubt.';
      triggerAlert(msg, 'error');
    } finally {
      setIsSubmittingDoubt(false);
    }
  };

  const removeFavorite = async (teacherId) => {
    try {
      await axios.post(`/api/students/favorite/${teacherId}`);
      fetchFavorites();
      triggerAlert('Bookmark removed.');
    } catch (err) {
      console.error(err);
    }
  };

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4000);
  };

  const handleResendVerification = async () => {
    if (resendLoading) return;
    setResendLoading(true);
    try {
      await axios.post('/api/auth/resend-otp', {
        email: user?.email
      });
      triggerAlert(
        i18n.language === 'hi' 
          ? 'सत्यापन कोड आपके ईमेल पर पुनः भेजा गया है।' 
          : 'Verification code resent to your email successfully.'
      );
    } catch (err) {
      console.error(err);
      const errData = err.response?.data?.message;
      const localizedError = typeof errData === 'object'
        ? (i18n.language === 'hi' ? errData.hi : errData.en)
        : (errData || 'Failed to resend code.');
      triggerAlert(localizedError);
    } finally {
      setResendLoading(false);
    }
  };

  const renderProfilePhoto = (photoPath, className = "w-10 h-10 rounded-full object-cover border border-slate-200") => {
    const formattedUrl = getProfilePhotoUrl(photoPath);
    if (formattedUrl) {
      return <img src={formattedUrl} alt="Profile" className={className} onError={handleProfileImageError} />;
    }
    return (
      <div className={`${className} bg-slate-100 flex items-center justify-center text-slate-400`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-1/2 h-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Alert popup */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-lg border bg-slate-900 text-white border-slate-800 flex items-center space-x-2 text-sm font-semibold animate-slide-up">
          <AlertCircle size={18} className="text-[#f97316]" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Unsupported Teachers Warning Banners */}
      {unsupportedTeachers.map(teacher => (
        <div key={teacher._id} className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-3xl mb-6 shadow-sm flex items-start space-x-4 animate-fade-in">
          <AlertCircle className="text-rose-500 shrink-0 mt-1" size={24} />
          <div className="space-y-1 text-left">
            <h4 className="font-outfit font-extrabold text-sm sm:text-base text-rose-900">
              {i18n.language === 'hi' 
                ? `शिक्षक ${teacher.user?.name || 'Tutor'} वर्तमान में आपकी कक्षा का समर्थन नहीं करते हैं` 
                : `Tuition Support Paused with ${teacher.user?.name || 'Teacher'}`}
            </h4>
            <p className="text-xs sm:text-sm text-rose-700 leading-relaxed font-semibold">
              {i18n.language === 'hi'
                ? `आपके शिक्षक वर्तमान में केवल कक्षा ${teacher.teachesFrom || 1}–${teacher.teachesTo || 12} को पढ़ाते हैं। आप कक्षा ${studentClass} में नामांकित हैं। यह शिक्षक अभी आपकी कक्षा को नहीं पढ़ा रहे हैं। कृपया शिक्षक से संपर्क करें या किसी अन्य उपलब्ध शिक्षक के साथ पंजीकरण करें।`
                : `Your teacher currently teaches Class ${teacher.teachesFrom || 1}–${teacher.teachesTo || 12} only. You are enrolled in ${studentClass}. This teacher is not teaching your class at the moment. Please contact the teacher or enroll with another available teacher.`}
            </p>
          </div>
        </div>
      ))}

      {/* Dismissible warning banner if unverified */}
      {!user?.emailVerified && !bannerDismissed && (
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-3xl p-5 text-white mb-6 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in text-left">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <AlertCircle size={24} className="shrink-0 animate-bounce hidden sm:block" />
            <div>
              <h3 className="font-outfit font-black text-base">
                {i18n.language === 'hi' ? 'आपका ईमेल सत्यापित नहीं है!' : 'Verify Your Email Address'}
              </h3>
              <p className="text-white/80 text-xs font-semibold mt-0.5">
                {i18n.language === 'hi'
                  ? 'कृपया सभी सुविधाओं का उपयोग करने के लिए अपना ईमेल सत्यापित करें।'
                  : 'Please verify your email to unlock all platform capabilities.'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate('/verify-email')}
              className="bg-white hover:bg-slate-50 text-rose-600 font-black text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow cursor-pointer border border-transparent"
            >
              {i18n.language === 'hi' ? 'अभी सत्यापित करें' : 'Verify Now'}
            </button>
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="bg-rose-600/30 hover:bg-rose-600/40 border border-white/20 text-white font-black text-xs px-4 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer border-transparent"
            >
              {resendLoading ? '...' : (i18n.language === 'hi' ? 'ओटीपी पुनः भेजें' : 'Resend Code')}
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer border border-transparent"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Dismissible setup prompt if student class or subjects are missing */}
      {showPreferencesPrompt && (
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-5 text-white mb-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in text-left">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <Sparkles size={24} className="shrink-0 text-yellow-200 hidden sm:block animate-pulse" />
            <div>
              <h3 className="font-outfit font-black text-base">
                {i18n.language === 'hi' ? 'अपनी अध्ययन प्रोफ़ाइल सेट करें! (30 सेकंड)' : 'Personalize Your Study Buddy in 30 Seconds!'}
              </h3>
              <p className="text-white/90 text-xs font-semibold mt-0.5">
                {i18n.language === 'hi'
                  ? 'अपनी कक्षा और अध्ययन के विषय चुनें ताकि गुरुएआई आपके पाठ्यक्रम के अनुसार व्याख्या और क्विज़ तैयार कर सके।'
                  : 'Select your class and subjects so GuruAI can tailor explanations, homework guidance, and practice quizzes to your syllabus.'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsPrefModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-orange-600 font-black text-xs px-5 py-2.5 rounded-xl active:scale-95 transition-all shadow cursor-pointer border border-transparent"
            >
              {i18n.language === 'hi' ? 'अभी सेट करें' : 'Set Up Preferences'}
            </button>
            <button
              onClick={() => setShowPreferencesPrompt(false)}
              className="hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer border border-transparent text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Content Area: Tab Switcher & Active Section */}
        <div className="lg:col-span-12 space-y-6">
          
          {/* Main Tab Switches */}
          <div className="flex border-b border-slate-100 space-x-6 pb-px overflow-x-auto scrollbar-none">
            <button
              onClick={() => setMainTab('classroom')}
              className={`pb-3 font-outfit font-extrabold text-sm tracking-wide border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                mainTab === 'classroom'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>🏫</span>
              <span>{i18n.language === 'hi' ? 'मेरा ट्यूशन क्लासरूम' : 'My Tuition Classroom'}</span>
              {joinedTeachers.length > 0 && (
                <span className="bg-brand-100 text-brand-700 text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                  {joinedTeachers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setMainTab('ai')}
              className={`pb-3 font-outfit font-extrabold text-sm tracking-wide border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                mainTab === 'ai'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>🤖</span>
              <span>{i18n.language === 'hi' ? 'गुरुएआई — स्टडी बडी' : 'GuruAI — Study Buddy'}</span>
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                AI
              </span>
            </button>

            <button
              onClick={() => setMainTab('explore')}
              className={`pb-3 font-outfit font-extrabold text-sm tracking-wide border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                mainTab === 'explore'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>⭐</span>
              <span>{i18n.language === 'hi' ? 'खोजें और अनुरोध' : 'Explore & Bookmarks'}</span>
            </button>

            <button
              onClick={() => setMainTab('billing')}
              className={`pb-3 font-outfit font-extrabold text-sm tracking-wide border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                mainTab === 'billing'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>🧾</span>
              <span>{i18n.language === 'hi' ? 'शुल्क और रसीदें' : 'Billing & Receipts'}</span>
              {billingHistory.length > 0 && (
                <span className="bg-slate-100 text-slate-600 text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                  {billingHistory.length}
                </span>
              )}
            </button>
          </div>

          {/* ========================================================
              TAB 1: MY TUITION CLASSROOM
              ======================================================== */}
          {mainTab === 'classroom' && (
            <div className="space-y-6" id="classroom-section">
              
              {/* Lookup Card Block */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h4 className="font-outfit font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <Sparkles size={16} className="text-[#f97316]" />
                    <span>{i18n.language === 'hi' ? 'कनेक्शन कोड द्वारा शिक्षक से जुड़ें' : 'Join Existing Tuition Classroom'}</span>
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    {i18n.language === 'hi'
                      ? 'अपने ट्यूशन शिक्षक द्वारा दिया गया कनेक्शन कोड (जैसे GC-NAME-XXXX) नीचे भरें।'
                      : 'Enter the unique connection code shared by your teacher to access study notes, doubts, attendance, and homework.'}
                  </p>
                </div>

                <form onSubmit={handleTeacherLookup} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={teacherCodeInput}
                      onChange={(e) => setTeacherCodeInput(e.target.value)}
                      placeholder="e.g. GC-DANISH-7845"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:bg-white outline-none focus:border-brand-500 transition-all uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={lookupLoading || !teacherCodeInput.trim()}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    {lookupLoading ? 'Searching...' : 'Lookup'}
                  </button>
                </form>

                {lookupError && (
                  <p className="text-xs font-semibold text-rose-500 bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center space-x-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{lookupError}</span>
                  </p>
                )}

                {/* Looked up Teacher Display */}
                {lookedUpTeacher && !claimableRecord && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 animate-fade-in">
                    <div className="flex items-center space-x-4">
                      {renderProfilePhoto(lookedUpTeacher.profileImage || lookedUpTeacher.profilePhoto, "w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm")}
                      <div className="space-y-0.5">
                        <h5 className="font-outfit font-black text-slate-900 text-base">{lookedUpTeacher.name}</h5>
                        <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 inline-block">
                          Verified Local Guru
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1 font-medium bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                      <p><span className="font-bold text-slate-600">Subjects:</span> {lookedUpTeacher.subjects?.join(', ')}</p>
                      <p><span className="font-bold text-slate-600">Location:</span> {lookedUpTeacher.teachingArea || 'Locality'}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleConnect}
                        disabled={isSubmittingConnect}
                        className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>{i18n.language === 'hi' ? 'कनेक्शन अनुरोध भेजें' : 'Send Connection Request'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setLookedUpTeacher(null);
                          setTeacherCodeInput('');
                        }}
                        className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                      >
                        {i18n.language === 'hi' ? 'रद्द करें' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Smart Matching Claim Seat Card */}
                {claimableRecord && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-5 space-y-4 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/20 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl mt-0.5">🎉</span>
                      <div className="space-y-1">
                        <h5 className="font-outfit font-black text-orange-950 text-base">
                          {i18n.language === 'hi' ? 'स्मार्ट-मैच रिकॉर्ड मिल गया!' : 'Smart Tuition Match Found!'}
                        </h5>
                        <p className="text-xs text-orange-700/90 font-semibold leading-relaxed">
                          {claimableRecord.message}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-2xs p-3.5 rounded-xl border border-orange-200/60 text-xs font-semibold text-slate-700 space-y-1">
                      <p><span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Student Name:</span> {claimableRecord.enrollment.name}</p>
                      <p><span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Enrolled standard:</span> {claimableRecord.enrollment.class}</p>
                      <p><span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Subject:</span> {claimableRecord.enrollment.subject}</p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleClaim}
                        disabled={isSubmittingConnect}
                        className="flex-1 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl shadow-md hover:shadow active:scale-95 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Check size={14} />
                        <span>{i18n.language === 'hi' ? 'सीट का दावा करें और सिंक करें' : 'Sync & Claim My Seat'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setClaimableRecord(null);
                          setLookedUpTeacher(null);
                          setTeacherCodeInput('');
                        }}
                        className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                      >
                        {i18n.language === 'hi' ? 'छोड़ें' : 'Ignore'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Notifications Widget */}
              {dashboardNotifications.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-outfit font-black text-slate-900 text-base flex items-center gap-2">
                      <span>🔔 {i18n.language === 'hi' ? 'हाल की सूचनाएं' : 'Recent Notifications'}</span>
                      <span className="bg-brand-50 text-brand-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-100 font-sans">
                        {dashboardNotifications.filter(n => !n.read).length} {i18n.language === 'hi' ? 'अपठित' : 'unread'}
                      </span>
                    </h4>
                    <button
                      onClick={async () => {
                        try {
                          await axios.put('/api/notifications/read-all');
                          setDashboardNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors border-none bg-transparent cursor-pointer font-sans"
                    >
                      {i18n.language === 'hi' ? 'सभी को पढ़ा हुआ चिह्नित करें' : 'Mark all read'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dashboardNotifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif._id}
                        onClick={async () => {
                          try {
                            if (!notif.read) {
                              await axios.put(`/api/notifications/read/${notif._id}`);
                              setDashboardNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
                            }
                            if (notif.link) navigate(notif.link);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm flex items-start gap-3 ${
                          notif.read
                            ? 'bg-slate-50/50 border-slate-100/60 hover:bg-slate-50'
                            : 'bg-indigo-50/10 border-indigo-100/40 hover:bg-indigo-50/20'
                        }`}
                      >
                        {/* Icon */}
                        <div className={`p-2 rounded-xl shrink-0 ${
                          notif.read ? 'bg-slate-100 text-slate-400' : 'bg-brand-50 text-brand-500'
                        }`}>
                          {notif.type === 'ENROLLMENT_REQUEST' ? <UserPlus size={14} /> :
                           notif.type === 'ENROLLMENT_ACCEPTED' ? <Check size={14} className="text-emerald-500" /> :
                           notif.type === 'NEW_NOTE' ? <BookOpen size={14} /> :
                           notif.type === 'NEW_DOUBT' ? <MessageSquare size={14} /> :
                           notif.type === 'DOUBT_REPLY' ? <MessageSquare size={14} className="text-emerald-500" /> :
                           notif.type === 'ATTENDANCE_MARKED' ? <ClipboardCheck size={14} className="text-indigo-500" /> :
                           notif.type === 'FEE_DUE' ? <DollarSign size={14} className="text-rose-500" /> :
                           notif.type === 'ANNOUNCEMENT' ? <Globe size={14} className="text-amber-500" /> :
                           <Bell size={14} />}
                        </div>

                        {/* Text */}
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <h5 className={`text-xs font-extrabold truncate ${
                              notif.read ? 'text-slate-600' : 'text-slate-800'
                            }`}>
                              {notif.title}
                            </h5>
                            <span className="text-[9px] text-slate-400 font-semibold shrink-0 font-sans mt-0.5">
                              {new Date(notif.createdAt).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-1 break-words line-clamp-2 leading-relaxed ${
                            notif.read ? 'text-slate-400' : 'text-slate-600 font-medium'
                          }`}>
                            {notif.message}
                          </p>
                        </div>

                        {/* Unread Indicator */}
                        {!notif.read && (
                          <div className="w-2.5 h-2.5 bg-brand-500 rounded-full shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Classroom Data views */}
              {joinedTeachers.length === 0 ? (
                <div className="glass-card p-12 rounded-3xl border border-slate-100 text-center text-slate-400 font-medium bg-white flex flex-col items-center space-y-4">
                  <span className="text-5xl">🏫</span>
                  <h4 className="font-outfit font-extrabold text-slate-800 text-lg">
                    {i18n.language === 'hi' ? 'डिजिटल क्लासरूम अनलॉक करें' : 'Digital Tuition Classroom is Locked'}
                  </h4>
                  <p className="max-w-md text-xs text-slate-400 font-semibold leading-relaxed">
                    {i18n.language === 'hi'
                      ? 'शंकाएं पूछने, अध्ययन नोट्स डाउनलोड करने, गृहकार्य समय सीमा को ट्रैक करने और मासिक उपस्थिति प्रतिशत देखने के लिए सबसे पहले अपने शिक्षक के कनेक्शन कोड का उपयोग करके उनसे जुड़ें।'
                      : 'To access lecture notes, doubts discussions, attendance logs, and assignment taskboards, input your teacher\'s Connection Code above.'}
                  </p>
                  <div className="w-16 h-1 bg-brand-500 rounded-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Classroom Data views */}
                  <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
                    
                    {/* Classroom navigation sub-tabs */}
                  <div className="flex border-b border-slate-100 space-x-2 pb-px overflow-x-auto scrollbar-none">
                    {[
                      { id: 'announcements', label: i18n.language === 'hi' ? 'घोषणाएँ' : 'Announcements', icon: '📢' },
                      { id: 'homework', label: i18n.language === 'hi' ? 'गृहकार्य' : 'Homework', icon: '📝' },
                      { id: 'notes', label: i18n.language === 'hi' ? 'नोट्स' : 'Study Notes', icon: '📚' },
                      { id: 'doubts', label: i18n.language === 'hi' ? 'शंका समाधान' : 'Doubts Forum', icon: '💬' },
                      { id: 'attendance', label: i18n.language === 'hi' ? 'उपस्थिति' : 'Attendance Logs', icon: '📊' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setClassroomActiveTab(tab.id)}
                        className={`px-4 py-2 font-outfit font-bold text-xs tracking-wide rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                          classroomActiveTab === tab.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* SUB-VIEW 1: ANNOUNCEMENTS BOARD */}
                  {classroomActiveTab === 'announcements' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h4 className="font-outfit font-black text-slate-900 text-lg">
                          {i18n.language === 'hi' ? 'महत्वपूर्ण सूचनाएं' : 'Tuition Noticeboard'}
                        </h4>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          {studentAnnouncements.length} {i18n.language === 'hi' ? 'घोषणाएँ' : 'Announcements'}
                        </span>
                      </div>

                      {studentAnnouncements.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 rounded-2xl text-slate-400 text-xs font-semibold">
                          📢 {i18n.language === 'hi' ? 'कोचिंग कक्षा में कोई नई घोषणा नहीं है।' : 'No announcements published yet.'}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {studentAnnouncements.map((a) => (
                            <div key={a._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 relative overflow-hidden hover:bg-slate-50/70 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <span className="bg-brand-50 border border-brand-100 text-brand-700 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg">
                                  {a.teacher?.user?.name || 'Local Teacher'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {new Date(a.createdAt).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <h5 className="font-outfit font-extrabold text-slate-900 text-base mb-1">{a.title}</h5>
                              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap font-medium">{a.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-VIEW 2: HOMEWORK TRACKER */}
                  {classroomActiveTab === 'homework' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h4 className="font-outfit font-black text-slate-900 text-lg">
                          {i18n.language === 'hi' ? 'गृहकार्य कार्यपत्रक' : 'Homework Taskboard'}
                        </h4>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          {studentHomeworks.length} {i18n.language === 'hi' ? 'दिए गए कार्य' : 'Tasks'}
                        </span>
                      </div>

                      {studentHomeworks.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 rounded-2xl text-slate-400 text-xs font-semibold">
                          📝 {i18n.language === 'hi' ? 'कोचिंग कक्षा में कोई गृहकार्य नहीं है।' : 'No homework tasks assigned yet.'}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {studentHomeworks.map((h) => {
                            const isPast = new Date(h.deadline) < new Date();
                            return (
                              <div key={h._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:bg-slate-50/70 transition-colors group">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="bg-cyan-50 border border-cyan-100 text-cyan-700 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg">
                                      {h.teacher?.user?.name || 'Local Teacher'}
                                    </span>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                                      isPast ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                      <Clock size={10} />
                                      <span>{isPast ? (i18n.language === 'hi' ? 'समय बीत गया' : 'Passed') : (i18n.language === 'hi' ? 'लंबित' : 'Pending')}</span>
                                    </span>
                                  </div>
                                  <h5 className="font-outfit font-extrabold text-slate-900 text-base leading-snug">{h.title}</h5>
                                  <p className="text-slate-500 text-xs leading-relaxed font-medium">{h.description}</p>
                                </div>
                                <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-[10px] font-bold text-slate-400 mt-4">
                                  <span>{i18n.language === 'hi' ? 'समय सीमा:' : 'Deadline:'}</span>
                                  <span className="text-slate-700 font-mono">
                                    {new Date(h.deadline).toLocaleString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-VIEW 3: STUDY NOTES & MATERIALS */}
                  {classroomActiveTab === 'notes' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h4 className="font-outfit font-black text-slate-900 text-lg">
                          {i18n.language === 'hi' ? 'अध्ययन सामग्री और नोट्स' : 'Study Notes & Materials'}
                        </h4>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          {studentNotes.length} {i18n.language === 'hi' ? 'नोट्स' : 'Resources'}
                        </span>
                      </div>

                      {studentNotes.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 rounded-2xl text-slate-400 text-xs font-semibold">
                          📚 {i18n.language === 'hi' ? 'अभी तक कोई अध्ययन नोट्स अपलोड नहीं किया गया है।' : 'No study materials uploaded yet.'}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {studentNotes.map((n) => (
                            <div key={n._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-xs transition-all hover:bg-slate-50/70">
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="p-3 bg-brand-50 text-brand-600 rounded-xl shrink-0">
                                  <FileText size={18} />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-outfit font-extrabold text-slate-900 text-sm leading-snug truncate" title={n.title}>
                                    {n.title}
                                  </h5>
                                  <div className="flex items-center space-x-1.5 mt-0.5">
                                    <span className="text-[9px] text-[#f97316] font-black uppercase bg-orange-50 px-1 rounded-sm border border-orange-100">
                                      {n.fileType || 'pdf'}
                                    </span>
                                    <span className="text-slate-300 text-[8px]">•</span>
                                    <span className="text-[9px] text-slate-400 font-bold truncate">
                                      {n.teacher?.user?.name}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setMainTab('ai')}
                                  className="p-2 text-orange-600 hover:text-white hover:bg-orange-500 bg-orange-50 rounded-xl transition-all flex items-center space-x-1 cursor-pointer text-[10px] font-bold shadow-3xs"
                                  title="Ask GuruAI about this note"
                                >
                                  <Sparkles size={12} />
                                  <span className="hidden sm:inline">Ask AI</span>
                                </button>
                                <a
                                  href={n.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer border border-transparent hover:border-brand-100 shadow-2xs bg-white"
                                  title="Open / Download Lecture Note"
                                >
                                  <Download size={14} />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-VIEW 4: DOUBTS QA DISCUSSIONS */}
                  {classroomActiveTab === 'doubts' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h4 className="font-outfit font-black text-slate-900 text-lg">
                          {i18n.language === 'hi' ? 'शंका समाधान मंच' : 'Doubt Discussion Forum'}
                        </h4>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          {studentDoubts.length} {i18n.language === 'hi' ? 'शंकाएं' : 'Queries'}
                        </span>
                      </div>

                      {/* Ask Doubt input block */}
                      <form onSubmit={handleAskDoubt} className="space-y-4 bg-slate-50 border border-slate-100 rounded-2xl p-5">
                        <h5 className="font-outfit font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1">
                          <MessageSquare size={13} className="text-[#f97316]" />
                          <span>{i18n.language === 'hi' ? 'एक नई शंका पूछें' : 'Ask a New Doubt'}</span>
                        </h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1 space-y-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Select Tutor Teacher</label>
                            <select
                              value={doubtTargetTeacher}
                              onChange={(e) => setDoubtTargetTeacher(e.target.value)}
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 transition-all cursor-pointer shadow-2xs"
                            >
                              {joinedTeachers.map((t) => (
                                <option key={t._id} value={t._id}>
                                  {t.user?.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Describe Your Question</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newDoubtQuestion}
                                onChange={(e) => setNewDoubtQuestion(e.target.value)}
                                placeholder="e.g. Sir, can you explain photosynthesis process in detail?"
                                className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-500 transition-all shadow-2xs"
                              />
                              <button
                                type="submit"
                                disabled={isSubmittingDoubt || !newDoubtQuestion.trim()}
                                className="px-5 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition-all flex items-center justify-center space-x-1 cursor-pointer shrink-0"
                              >
                                <span>{isSubmittingDoubt ? 'Sending...' : 'Ask Guru'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>

                      {/* Doubts list */}
                      {studentDoubts.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 rounded-2xl text-slate-400 text-xs font-semibold">
                          💬 {i18n.language === 'hi' ? 'आपने अभी तक कोई शंका नहीं पूछी है।' : 'No doubts submitted yet. Type your query above.'}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {studentDoubts.map((d) => (
                            <div key={d._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-2xs space-y-3 hover:bg-slate-50/70 transition-colors">
                              <div className="flex justify-between items-center">
                                <span className="bg-slate-200 border border-slate-300 text-slate-700 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                                  Teacher: {d.teacher?.user?.name || 'Local Teacher'}
                                </span>
                                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                  d.isResolved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                }`}>
                                  {d.isResolved ? (i18n.language === 'hi' ? 'हल किया गया' : 'Resolved') : (i18n.language === 'hi' ? 'लंबित उत्तर' : 'Awaiting Reply')}
                                </span>
                              </div>
                              
                              <div>
                                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{i18n.language === 'hi' ? 'छात्र का प्रश्न' : 'Your Query'}</p>
                                <h5 className="font-outfit font-extrabold text-slate-900 text-sm mt-0.5">{d.question}</h5>
                              </div>
                              
                              {d.isResolved && d.answer && (
                                <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-xl p-4 text-xs">
                                  <p className="text-emerald-700 font-extrabold text-[9px] uppercase tracking-wider">{i18n.language === 'hi' ? 'शिक्षक की प्रतिक्रिया' : 'Teacher Clarification'}</p>
                                  <p className="text-slate-700 font-semibold mt-1 leading-relaxed whitespace-pre-wrap">{d.answer}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-VIEW 5: ATTENDANCE TRACKER & HISTORY */}
                  {classroomActiveTab === 'attendance' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h4 className="font-outfit font-black text-slate-900 text-lg">
                          {i18n.language === 'hi' ? 'उपस्थिति विश्लेषण' : 'Attendance Analytics'}
                        </h4>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          {attendanceHistory.length} {i18n.language === 'hi' ? 'दिन रिकॉर्ड' : 'Days Tracked'}
                        </span>
                      </div>

                      {/* Analytics Widgets */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center shadow-2xs relative overflow-hidden group">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Attendance Rate</p>
                          <h3 className="font-outfit font-black text-brand-600 text-2xl mt-1">{attendanceMetrics.percentage}%</h3>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
                            <div 
                              className="bg-brand-500 h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: `${attendanceMetrics.percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center shadow-2xs">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Total Teaching Days</p>
                          <h3 className="font-outfit font-black text-slate-900 text-2xl mt-1">{attendanceMetrics.totalDays}</h3>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center shadow-2xs">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider text-emerald-600">Present Days</p>
                          <h3 className="font-outfit font-black text-emerald-600 text-2xl mt-1">{attendanceMetrics.presentDays}</h3>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center shadow-2xs">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider text-rose-500">Absent Days</p>
                          <h3 className="font-outfit font-black text-rose-500 text-2xl mt-1">{attendanceMetrics.absentDays}</h3>
                        </div>
                      </div>

                      {/* Attendance Log Table */}
                      <div className="space-y-3">
                        <h5 className="font-outfit font-extrabold text-slate-900 text-sm">Attendance Chronicle</h5>
                        
                        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
                          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                            {attendanceHistory.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                                No attendance markers submitted yet by your teacher.
                              </div>
                            ) : (
                              attendanceHistory.map((log) => (
                                <div key={log._id} className="p-3.5 flex items-center justify-between text-xs font-semibold hover:bg-slate-50/40 transition-colors">
                                  <div className="space-y-0.5">
                                    <p className="text-slate-900 font-bold">
                                      {new Date(log.date).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      Taught by: {log.teacher?.user?.name || 'Local Teacher'} {log.class ? `(${log.class})` : ''}
                                    </p>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border shadow-3xs ${
                                    log.status === 'present' 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                      : 'bg-rose-50 text-rose-500 border-rose-100'
                                  }`}>
                                    {log.status === 'present' ? (i18n.language === 'hi' ? 'उपस्थित' : 'Present') : (i18n.language === 'hi' ? 'अनुपस्थित' : 'Absent')}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  </div>

                  {/* My Teachers Sidebar */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-outfit font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                          <span>🎓</span>
                          <span>{i18n.language === 'hi' ? 'मेरे शिक्षक' : 'My Teachers'}</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {i18n.language === 'hi'
                            ? 'आपके सभी सक्रिय ट्यूशन शिक्षक।'
                            : 'All of your active tutoring instructors.'}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {joinedTeachers.map((teacher) => {
                          const imgPath = teacher.user?.profileImage || teacher.user?.profilePhoto || teacher.profileImage || teacher.profilePhoto || '';
                          return (
                            <div key={teacher._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative overflow-hidden group">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                                  {renderProfilePhoto(imgPath, "w-full h-full object-cover")}
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="font-outfit font-bold text-slate-800 text-xs leading-tight">
                                    {teacher.user?.name || 'Tutor'}
                                  </h4>
                                  <p className="text-[9px] font-black text-brand-600 uppercase tracking-wider">
                                    {teacher.subjects?.join(', ')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-[10px] text-slate-500 space-y-1 font-medium bg-white p-2.5 rounded-xl border border-slate-100/60">
                                <p><span className="font-bold text-slate-600">Qualification:</span> {teacher.qualification}</p>
                                <p><span className="font-bold text-slate-600">Timings:</span> {teacher.timings}</p>
                                <p><span className="font-bold text-slate-600">Fees:</span> ₹{teacher.fees}/month</p>
                                {teacher.user?.phone && (
                                  <p className="flex items-center gap-1 mt-1 text-slate-600">
                                    <Phone size={10} className="text-slate-400" />
                                    <span className="font-mono">{teacher.user.phone}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 2: EXPLORE & BOOKMARKS
              ======================================================== */}
          {mainTab === 'explore' && (
            <div className="space-y-8 animate-fade-in" id="explore-section">
              
              {/* Favorites bookmarks list */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-outfit font-extrabold text-2xl text-slate-900">{t('dashboard.student.favTitle')}</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {t('dashboard.student.favHelp')}
                  </p>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    <div className="shimmer rounded-3xl h-24"></div>
                    <div className="shimmer rounded-3xl h-24"></div>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="glass-card p-10 rounded-3xl border border-slate-100 text-center text-slate-400 font-medium bg-slate-50 flex flex-col items-center space-y-3">
                    <span className="text-3xl">⭐</span>
                    <p className="text-xs max-w-sm font-semibold">{t('dashboard.student.noFavs')}</p>
                    <Link
                      to="/nearby"
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow active:scale-95 transition-all"
                    >
                      Go Discover Local Teachers
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((teacher) => (
                      <div key={teacher._id} className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all relative group">
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-1">
                            <div className="flex items-center space-x-3">
                              {renderProfilePhoto(teacher.user?.profilePhoto || teacher.user?.profileImage, "w-10 h-10 rounded-full object-cover")}
                              <div>
                                <h4 className="font-outfit font-black text-slate-900 text-base leading-tight">
                                  {teacher.user?.name}
                                </h4>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  <StarRating rating={teacher.rating} size={9} />
                                  <span className="text-[9px] text-slate-400 font-extrabold">({teacher.reviewCount})</span>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => removeFavorite(teacher._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                              title="Remove Bookmark"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-500 space-y-0.5 font-medium leading-tight pt-1">
                            <p className="truncate"><span className="font-bold text-slate-600">Subjects: </span>{teacher.subjects?.join(', ')}</p>
                            <p><span className="font-bold text-slate-600">Classes: </span>{teacher.classes?.join(', ')}</p>
                            <p className="text-emerald-600 font-bold flex items-center gap-0.5 mt-1.5">
                              <MapPin size={11} className="text-[#f97316]" />
                              <span className="truncate">Academy: {teacher.address || teacher.villageOrArea}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-4">
                          <span className="font-outfit font-black text-brand-600 text-base">₹{teacher.fees}/mo</span>
                          <Link
                            to={`/teacher-profile/${teacher._id}`}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg shadow-sm hover:shadow active:scale-95 transition-all"
                          >
                            View Profile
                          </Link>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tuition Enrollment Requests */}
              <div id="requests-section" className="space-y-4 pt-6 border-t border-slate-100">
                <div>
                  <h3 className="font-outfit font-extrabold text-2xl text-slate-900">
                    {i18n.language === 'hi' ? 'ट्यूशन प्रवेश अनुरोध' : 'Tuition Enrollment Requests'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {i18n.language === 'hi' 
                      ? 'स्थानीय कोचिंग शिक्षकों को भेजे गए आपके अनुरोध और उनकी स्वीकृति की वर्तमान स्थिति।' 
                      : 'Track your pending applications or enrollment clearances with nearby teachers.'}
                  </p>
                </div>

                {requests.length === 0 ? (
                  <div className="glass-card p-10 rounded-3xl border border-slate-100 text-center text-slate-400 font-medium bg-slate-50 flex flex-col items-center space-y-3">
                    <span className="text-3xl">📬</span>
                    <p className="text-xs max-w-sm font-semibold">
                      {i18n.language === 'hi' 
                        ? 'आपने अभी तक कोई प्रवेश अनुरोध नहीं भेजा है।' 
                        : 'You have not submitted any tuition join requests yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((r) => {
                      const teacherName = r.teacher?.user?.name || 'Local Teacher';
                      const teacherPhone = r.parentPhone || r.teacher?.user?.phone || 'Not Shared';
                      const teacherAddress = r.teacher?.address || 'Locality Area';
                      const requestDate = new Date(r.createdAt).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });

                      return (
                        <div 
                          key={r._id} 
                          className="bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between group"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-outfit font-black text-slate-900 text-base leading-tight">
                                  {teacherName}
                                </h4>
                                <span className="text-[9px] font-extrabold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                                  {requestDate}
                                </span>
                              </div>

                              <div className="text-xs text-slate-500 space-y-1 font-medium leading-relaxed">
                                <p>
                                  <strong className="text-slate-600">{i18n.language === 'hi' ? 'अनुरोधित विषय:' : 'Requested Subject:'} </strong>
                                  <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold text-[10px]">
                                    {r.subject}
                                  </span>
                                </p>
                                
                                {r.message && (
                                  <p className="text-[11px] italic text-slate-400">
                                    "{r.message}"
                                  </p>
                                )}

                                {r.status === 'accepted' && (
                                  <div className="mt-2 bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-100 space-y-1 text-[11px] font-semibold">
                                    <p className="text-emerald-700 font-extrabold flex items-center space-x-1">
                                      <Check size={12} className="shrink-0" />
                                      <span>{i18n.language === 'hi' ? 'बधाई हो! शिक्षक ने प्रवेश स्वीकार कर लिया है।' : 'Congratulations! Your enrollment is approved.'}</span>
                                    </p>
                                    <p className="flex items-center space-x-1 font-mono">
                                      <Phone size={11} className="shrink-0" />
                                      <span>{i18n.language === 'hi' ? `तैयार संपर्क: ${teacherPhone}` : `Tutor Contact: ${teacherPhone}`}</span>
                                    </p>
                                    <p className="flex items-center space-x-1">
                                      <MapPin size={11} className="shrink-0 text-[#f97316]" />
                                      <span>{i18n.language === 'hi' ? `कोचिंग का पता: ${teacherAddress}` : `Coaching Location: ${teacherAddress}`}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-3 shrink-0">
                              {r.status === 'pending' && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl flex items-center space-x-1">
                                  <Clock size={12} className="animate-spin duration-1000 shrink-0" />
                                  <span>{i18n.language === 'hi' ? 'लंबित' : 'Pending Response'}</span>
                                </span>
                              )}

                              {r.status === 'accepted' && (
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center space-x-1 shadow-sm">
                                  <Check size={12} />
                                  <span>{i18n.language === 'hi' ? 'स्वीकृत' : 'Enrollment Confirmed'}</span>
                                </span>
                              )}

                              {r.status === 'rejected' && (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl flex items-center space-x-1">
                                  <X size={12} />
                                  <span>{i18n.language === 'hi' ? 'अस्वीकृत' : 'Declined'}</span>
                                </span>
                              )}

                              <Link
                                to={`/teacher-profile/${r.teacher?._id}`}
                                className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-500 hover:text-brand-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 p-2 rounded-xl transition-all active:scale-95"
                              >
                                <ExternalLink size={11} />
                                <span>{i18n.language === 'hi' ? 'शिक्षक प्रोफ़ाइल' : 'View Teacher'}</span>
                              </Link>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: BILLING & RECEIPTS LEDGER
              ======================================================== */}
          {mainTab === 'billing' && (
            <div className="space-y-6 animate-fade-in" id="billing-section">
              <div>
                <h3 className="font-outfit font-extrabold text-2xl text-slate-900">
                  {i18n.language === 'hi' ? 'शुल्क और भुगतान इतिहास' : 'Billing & Receipts History'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  {i18n.language === 'hi'
                    ? 'अपने मासिक कोचिंग शुल्क चालान देखें और पेशेवर रूप से तैयार की गई रसीदें डाउनलोड करें।'
                    : 'Review monthly coaching fee invoices and download professional generated receipts.'}
                </p>
              </div>

              {billingHistory.length === 0 ? (
                <div className="glass-card p-10 rounded-3xl border border-slate-100 text-center text-slate-400 font-medium bg-slate-50 flex flex-col items-center space-y-3">
                  <span className="text-3xl">🧾</span>
                  <p className="text-xs max-w-sm font-semibold">
                    {i18n.language === 'hi'
                      ? 'कोई बिलिंग चालान अभी तक जारी नहीं हुआ है।'
                      : 'No billing invoices cleared or issued yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {billingHistory.map((record) => {
                    const teacherName = record.teacher?.user?.name || 'Local Teacher';
                    const tutorArea = record.teacher?.villageOrArea || record.teacher?.locality || 'Neighborhood Academy';
                    const paidDate = record.paidDate ? new Date(record.paidDate).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US') : 'Pending';
                    
                    return (
                      <div
                        key={record._id}
                        className="bg-white border border-slate-100 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between group"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-outfit font-black text-slate-900 text-base leading-tight">
                                {record.month} - {record.subject || 'Tuition Fees'}
                              </h4>
                              {record.receiptNumber && (
                                <span className="text-[9px] font-extrabold text-[#f97316] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded">
                                  {record.receiptNumber}
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-slate-500 space-y-1 font-medium leading-relaxed">
                              <p>
                                <strong className="text-slate-600">{i18n.language === 'hi' ? 'शिक्षक:' : 'Teacher:'} </strong>
                                <span className="text-slate-900 font-bold">{teacherName}</span>
                                <span className="text-[10px] text-slate-400 font-medium ml-1">({tutorArea})</span>
                              </p>
                              
                              <p>
                                <strong className="text-slate-600">{i18n.language === 'hi' ? 'भुगतान तिथि:' : 'Payment Date:'} </strong>
                                <span className="text-slate-700 font-bold">{paidDate}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-3 shrink-0">
                            <span className="font-outfit font-black text-slate-900 text-base">
                              ₹{record.amount}
                            </span>

                            <span className={`text-[10px] font-bold px-3 py-1 rounded-xl flex items-center space-x-1 shadow-3xs ${
                              record.status === 'paid'
                                ? 'text-emerald-600 bg-emerald-50 border border-emerald-100'
                                : 'text-amber-600 bg-amber-50 border border-amber-100'
                            }`}>
                              {record.status === 'paid' ? <Check size={12} /> : <Clock size={12} />}
                              <span>
                                {record.status === 'paid'
                                  ? (i18n.language === 'hi' ? 'चुकाया गया' : 'Paid')
                                  : (i18n.language === 'hi' ? 'अवैतनिक' : 'Unpaid')}
                              </span>
                            </span>

                            {record.status === 'paid' && (
                              <button
                                onClick={() => downloadReceiptPdf(record, record.teacher)}
                                className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-3xs"
                                title={i18n.language === 'hi' ? 'रसीद डाउनलोड करें' : 'Download Receipt'}
                              >
                                <Download size={12} />
                                <span>{i18n.language === 'hi' ? 'रसीद डाउनलोड करें' : 'Download PDF'}</span>
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 4: GURUAI STUDY HUB
              ======================================================== */}
          {mainTab === 'ai' && (
            <GuruAIHub
              studentClass={studentClass}
              joinedTeachers={joinedTeachers}
              userName={name || user?.name || ''}
              subjects={subjects}
              curriculum={curriculum}
              preferredLanguage={preferredLanguage}
              onPreferencesUpdated={(newPrefs) => {
                if (newPrefs.studentClass) setStudentClass(newPrefs.studentClass);
                if (newPrefs.subjects) setSubjects(newPrefs.subjects);
                if (newPrefs.curriculum) setCurriculum(newPrefs.curriculum);
                if (newPrefs.preferredLanguage) setPreferredLanguage(newPrefs.preferredLanguage);
                setShowPreferencesPrompt(false);
                triggerAlert(i18n.language === 'hi' ? 'सीखने की प्राथमिकताएं सफलतापूर्वक अपडेट की गईं!' : 'Learning preferences updated successfully!');
              }}
            />
          )}

        </div>

      </div>

      {/* Global Learning Preferences Modal */}
      <LearningPreferencesModal
        isOpen={isPrefModalOpen}
        onClose={() => setIsPrefModalOpen(false)}
        currentClass={studentClass}
        currentSubjects={subjects}
        currentCurriculum={curriculum}
        currentLanguage={preferredLanguage}
        onSaved={(newPrefs) => {
          if (newPrefs.studentClass) setStudentClass(newPrefs.studentClass);
          if (newPrefs.subjects) setSubjects(newPrefs.subjects);
          if (newPrefs.curriculum) setCurriculum(newPrefs.curriculum);
          if (newPrefs.preferredLanguage) setPreferredLanguage(newPrefs.preferredLanguage);
          setShowPreferencesPrompt(false);
          triggerAlert(i18n.language === 'hi' ? 'सीखने की प्राथमिकताएं सहेजी गईं!' : 'Learning preferences saved!');
        }}
      />

    </div>
  );
};

export default StudentDashboard;
