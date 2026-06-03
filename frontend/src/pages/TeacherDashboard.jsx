import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { getProfilePhotoUrl, handleProfileImageError } from '../utils/image';
import { downloadReceiptPdf } from '../utils/receiptPdf';
import { User, ClipboardCheck, DollarSign, MapPin, Navigation, Save, Trash2, Calendar, AlertCircle, UserPlus, Check, X, Inbox, Eye, BookOpen, MessageSquare, Phone, Clock, Users, CheckCircle, PlusCircle, Activity, Download } from 'lucide-react';


const teacherIcon = L.divIcon({
  html: `<div class="w-10 h-10 rounded-full bg-[#f97316] border-4 border-white flex items-center justify-center text-white shadow-xl"><span class="text-base">🏫</span></div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Helper component: Capture map clicks to relocate registration pins
const CoordinatePickerListener = ({ onLocationPick }) => {
  useMapEvents({
    click(e) {
      onLocationPick([e.latlng.lng, e.latlng.lat]);
    }
  });
  return null;
};

const TeacherDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'attendance', 'fees'

  // Tab 1: Profile State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subjects, setSubjects] = useState('');
  const [classes, setClasses] = useState('');
  const [fees, setFees] = useState(500);
  const [timings, setTimings] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState(0);
  const [mode, setMode] = useState('offline');
  const [address, setAddress] = useState('');
  const [villageOrArea, setVillageOrArea] = useState('');
  const [teachingArea, setTeachingArea] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [demoAvailable, setDemoAvailable] = useState(false);
  const [coordinates, setCoordinates] = useState([77.2090, 28.6139]); // Default [lng, lat]
  
  // Tab 2: Attendance State
  const [attStudentName, setAttStudentName] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('present');
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Tab 3: Fees State
  const [feeStudentName, setFeeStudentName] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeMonth, setFeeMonth] = useState('May 2026');
  const [feeStatus, setFeeStatus] = useState('unpaid');
  const [feeRecords, setFeeRecords] = useState([]);
  const [feeFilter, setFeeFilter] = useState('all'); // 'all', 'paid', 'unpaid'

  // Join Requests state
  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState('pending');

  // Global Info/Alert status
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'

  // Advanced Student Management & Invoicing States
  const [enrollments, setEnrollments] = useState([]);
  const [studentsFilter, setStudentsFilter] = useState('active'); // 'active', 'pending', 'add_manual'
  
  // Manual offline student form fields
  const [manualName, setManualName] = useState('');
  const [manualClass, setManualClass] = useState('');
  const [manualSubject, setManualSubject] = useState('');
  const [manualFees, setManualFees] = useState('');
  const [manualParentPhone, setManualParentPhone] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualJoiningDate, setManualJoiningDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance Register states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatuses, setAttendanceStatuses] = useState({}); // { enrollmentId: 'present' / 'absent' }

  // Fees ledger invoice fields
  const [feeEnrollmentId, setFeeEnrollmentId] = useState('');
  const [feeDueDate, setFeeDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [feeDueAmount, setFeeDueAmount] = useState(0);

  // Connection Code & QR Modal states
  const [connectionCode, setConnectionCode] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Classroom Hub Sub-system states
  const [classroomHubTab, setClassroomHubTab] = useState('notes'); // 'notes', 'doubts', 'homework', 'announcements', 'connections'
  
  // Classroom Hub Data states
  const [uploadedNotes, setUploadedNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteFileUrl, setNoteFileUrl] = useState('');
  const [noteFileType, setNoteFileType] = useState('pdf');

  const [doubts, setDoubts] = useState([]);
  const [doubtReplyId, setDoubtReplyId] = useState('');
  const [doubtReplyAnswer, setDoubtReplyAnswer] = useState('');

  const [homeworks, setHomeworks] = useState([]);
  const [hwTitle, setHwTitle] = useState('');
  const [hwDescription, setHwDescription] = useState('');
  const [hwDeadline, setHwDeadline] = useState('');

  const [announcements, setAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  const [teacherConnections, setTeacherConnections] = useState([]);

  // Fetch Classroom Sub-system datasets
  const fetchUploadedNotes = async () => {
    try {
      const { data } = await axios.get('/api/classroom/notes/teacher');
      setUploadedNotes(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoubts = async () => {
    try {
      const { data } = await axios.get('/api/classroom/doubts/teacher');
      setDoubts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHomeworks = async () => {
    try {
      const { data } = await axios.get('/api/classroom/homework/teacher');
      setHomeworks(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data } = await axios.get('/api/classroom/announcements/teacher');
      setAnnouncements(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeacherConnections = async () => {
    try {
      const { data } = await axios.get('/api/connections/teacher');
      setTeacherConnections(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Tuition Sub-systems submit & delete handlers
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteTitle || !noteFileUrl) return;
    try {
      await axios.post('/api/classroom/notes', {
        title: noteTitle,
        fileUrl: noteFileUrl,
        fileType: noteFileType
      });
      triggerAlert('PDF / Study Note uploaded successfully!', 'success');
      setNoteTitle('');
      setNoteFileUrl('');
      fetchUploadedNotes();
    } catch (err) {
      triggerAlert('Failed to upload study note.', 'error');
    }
  };

  const handleNoteDelete = async (noteId) => {
    try {
      await axios.delete(`/api/classroom/notes/${noteId}`);
      triggerAlert('Study Note deleted.', 'success');
      fetchUploadedNotes();
    } catch (err) {
      triggerAlert('Failed to delete note.', 'error');
    }
  };

  const handleDoubtReplySubmit = async (e) => {
    e.preventDefault();
    if (!doubtReplyId || !doubtReplyAnswer) return;
    try {
      await axios.put(`/api/classroom/doubts/reply/${doubtReplyId}`, {
        answer: doubtReplyAnswer
      });
      triggerAlert('Doubt answer resolved and shared!', 'success');
      setDoubtReplyId('');
      setDoubtReplyAnswer('');
      fetchDoubts();
    } catch (err) {
      triggerAlert('Failed to post reply.', 'error');
    }
  };

  const handleHomeworkSubmit = async (e) => {
    e.preventDefault();
    if (!hwTitle || !hwDescription || !hwDeadline) return;
    try {
      await axios.post('/api/classroom/homework', {
        title: hwTitle,
        description: hwDescription,
        deadline: hwDeadline
      });
      triggerAlert('Homework / Assignment posted!', 'success');
      setHwTitle('');
      setHwDescription('');
      setHwDeadline('');
      fetchHomeworks();
    } catch (err) {
      triggerAlert('Failed to post homework.', 'error');
    }
  };

  const handleHomeworkDelete = async (hwId) => {
    try {
      await axios.delete(`/api/classroom/homework/${hwId}`);
      triggerAlert('Homework task removed.', 'success');
      fetchHomeworks();
    } catch (err) {
      triggerAlert('Failed to delete homework.', 'error');
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    try {
      await axios.post('/api/classroom/announcements', {
        title: annTitle,
        content: annContent
      });
      triggerAlert('Tuition announcement posted!', 'success');
      setAnnTitle('');
      setAnnContent('');
      fetchAnnouncements();
    } catch (err) {
      triggerAlert('Failed to post announcement.', 'error');
    }
  };

  const handleAnnouncementDelete = async (annId) => {
    try {
      await axios.delete(`/api/classroom/announcements/${annId}`);
      triggerAlert('Announcement removed.', 'success');
      fetchAnnouncements();
    } catch (err) {
      triggerAlert('Failed to delete announcement.', 'error');
    }
  };

  const handleConnectionResponse = async (connId, action) => {
    try {
      await axios.put(`/api/connections/respond/${connId}`, { action });
      triggerAlert(action === 'accept' ? 'Connection accepted successfully!' : 'Connection declined.', 'success');
      fetchTeacherConnections();
      fetchEnrollments();
    } catch (err) {
      triggerAlert('Failed to process connection response.', 'error');
    }
  };

  useEffect(() => {
    fetchTeacherProfile();
    fetchAttendanceRecords();
    fetchFeeRecords();
    fetchRequests();
    fetchEnrollments();
    
    if (activeTab === 'classroom') {
      fetchUploadedNotes();
      fetchDoubts();
      fetchHomeworks();
      fetchAnnouncements();
      fetchTeacherConnections();
    }
  }, [activeTab, classroomHubTab]);

  useEffect(() => {
    // Support deep-linking tabs from the Profile dropdown
    const params = new URLSearchParams(window.location.search);
    const queryTab = params.get('tab');
    if (queryTab && ['profile', 'students', 'attendance', 'fees', 'requests', 'classroom'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [window.location.search]);

  // Fetch Teacher details
  const fetchTeacherProfile = async () => {
    try {
      const { data } = await axios.get('/api/teachers/my-profile');
      if (data) {
        setName(data.user.name);
        setPhone(data.user.phone);
        setSubjects(data.subjects.join(', '));
        setClasses(data.classes.join(', '));
        setFees(data.fees);
        setTimings(data.timings);
        setQualification(data.qualification);
        setExperience(data.experience);
        setMode(data.mode);
        setAddress(data.address);
        setVillageOrArea(data.villageOrArea || '');
        setTeachingArea(data.teachingArea || data.villageOrArea || '');
        setLocality(data.locality || '');
        setCity(data.city || 'Dhanbad');
        setState(data.state || 'Jharkhand');
        setDemoAvailable(data.demoAvailable);
        if (data.location?.coordinates) {
          setCoordinates(data.location.coordinates);
        }
        setConnectionCode(data.connectionCode || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const { data } = await axios.get('/api/classes/attendance');
      setAttendanceRecords(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeeRecords = async () => {
    try {
      const { data } = await axios.get('/api/classes/fees');
      setFeeRecords(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get('/api/requests/teacher');
      setRequests(data || []);
    } catch (err) {
      console.error('Failed to retrieve join requests:', err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const { data } = await axios.get('/api/enrollments');
      setEnrollments(data || []);
      
      // Sync attendance check statuses
      const activeEn = (data || []).filter(e => e.status === 'active');
      const statuses = {};
      activeEn.forEach(x => {
        statuses[x._id] = 'present';
      });
      setAttendanceStatuses(statuses);
    } catch (err) {
      console.error('Failed to retrieve student enrollments:', err);
    }
  };

  const handleManualStudentSubmit = async (e) => {
    e.preventDefault();
    if (!manualName || !manualClass || !manualSubject || manualFees === '') {
      triggerAlert('Name, Class, Subject, and Fees are required fields.', 'error');
      return;
    }
    try {
      await axios.post('/api/enrollments/manual', {
        name: manualName,
        class: manualClass,
        subject: manualSubject,
        fees: Number(manualFees),
        parentPhone: manualParentPhone,
        joiningDate: manualJoiningDate,
        notes: manualNotes
      });
      triggerAlert(
        i18n.language === 'hi' ? 'ऑफलाइन छात्र को सक्रिय छात्र के रूप में सफलतापूर्वक नामांकित किया गया।' : 'Offline manual student enrolled successfully!',
        'success'
      );
      setManualName('');
      setManualClass('');
      setManualSubject('');
      setManualFees('');
      setManualParentPhone('');
      setManualNotes('');
      fetchEnrollments();
      fetchFeeRecords();
      setStudentsFilter('active');
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to register manual offline student.', 'error');
    }
  };

  const handleMarkRequestPaid = async (enrollmentId) => {
    try {
      await axios.put(`/api/enrollments/${enrollmentId}/mark-paid`);
      triggerAlert(
        i18n.language === 'hi' ? 'भुगतान की पुष्टि हुई! छात्र अब सक्रिय सूची में है।' : 'Student enrollment payment confirmed! Student is now active.',
        'success'
      );
      fetchEnrollments();
      fetchFeeRecords();
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to confirm student payment.', 'error');
    }
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (!window.confirm(i18n.language === 'hi' ? 'क्या आप वाकई इस छात्र रिकॉर्ड को पूरी तरह से हटाना चाहते हैं?' : 'Are you sure you want to completely purge this student enrollment?')) {
      return;
    }
    try {
      await axios.delete(`/api/enrollments/${enrollmentId}`);
      triggerAlert(
        i18n.language === 'hi' ? 'छात्र रिकॉर्ड स्थानीय सर्वर से हटा दिया गया।' : 'Student record completely purged from server.',
        'success'
      );
      fetchEnrollments();
      fetchAttendanceRecords();
      fetchFeeRecords();
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to delete student cohort record.', 'error');
    }
  };

  const handleAttendanceCheckboxToggle = (enrollmentId) => {
    setAttendanceStatuses(prev => ({
      ...prev,
      [enrollmentId]: prev[enrollmentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const handleBulkAttendancePreset = (status) => {
    const activeEn = enrollments.filter(e => e.status === 'active');
    const newStatuses = {};
    activeEn.forEach(x => {
      newStatuses[x._id] = status;
    });
    setAttendanceStatuses(newStatuses);
  };

  const handleSaveBulkAttendance = async (e) => {
    e.preventDefault();
    const activeEn = enrollments.filter(e => e.status === 'active');
    if (activeEn.length === 0) return;

    const records = activeEn.map(x => ({
      enrollmentId: x._id,
      status: attendanceStatuses[x._id] || 'present'
    }));

    try {
      await axios.post('/api/enrollments/attendance', {
        date: attendanceDate,
        records
      });
      triggerAlert(
        i18n.language === 'hi' ? 'दैनिक उपस्थिति रजिस्टर सफलतापूर्वक सहेजा गया।' : 'Daily attendance log registered successfully!',
        'success'
      );
      fetchAttendanceRecords();
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to save daily attendance logs.', 'error');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.put(`/api/requests/${requestId}/accept`);
      triggerAlert(
        i18n.language === 'hi' ? 'अनुरोध स्वीकार कर लिया गया! छात्र आपकी सूची में जोड़ा गया।' : 'Enrollment request accepted successfully!',
        'success'
      );
      fetchRequests();
      fetchTeacherProfile();
      fetchEnrollments();
    } catch (err) {
      const msg = typeof err.response?.data?.message === 'object'
        ? (i18n.language === 'hi' ? err.response.data.message.hi : err.response.data.message.en)
        : 'Failed to accept student join request.';
      triggerAlert(msg, 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`/api/requests/${requestId}/reject`);
      triggerAlert(
        i18n.language === 'hi' ? 'अनुरोध सफलतापूर्वक खारिज कर दिया गया।' : 'Enrollment request rejected politely.',
        'success'
      );
      fetchRequests();
    } catch (err) {
      const msg = typeof err.response?.data?.message === 'object'
        ? (i18n.language === 'hi' ? err.response.data.message.hi : err.response.data.message.en)
        : 'Failed to reject student join request.';
      triggerAlert(msg, 'error');
    }
  };

  // Reverse Geocoding helper for Teacher Academy Location via Backend Proxy
  const reverseGeocode = async (lng, lat) => {
    try {
      const { data } = await axios.get(`/api/teachers/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (data && data.address) {
        const addr = data.address;
        const area = addr.suburb || addr.village || addr.town || addr.city || addr.city_district || addr.county || 'Detected Area';
        const state = addr.state || '';
        const formatted = state ? `${area}, ${state}` : area;
        
        // Auto-fill address if empty or mock update banner exists
        if (!address || address === 'Update Address' || address.startsWith('Lat:')) {
          setAddress(data.display_name || formatted);
        }
        return formatted;
      }
    } catch (err) {
      console.error('Teacher reverse geocoding error:', err);
    }
    return null;
  };

  // GPS auto coordinates locator
  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      triggerAlert(t('discovery.noTutorsNearby'), 'error');
      return;
    }
    triggerAlert('Detecting GPS Academy Location...', 'success');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;
        setCoordinates([longitude, latitude]);
        const areaName = await reverseGeocode(longitude, latitude);
        triggerAlert(
          t('dashboard.teacher.gpsSuccess') + (areaName ? `: ${areaName}` : ''),
          'success'
        );
      },
      (error) => {
        triggerAlert('Unable to acquire GPS signal. Please select manual maps instead.', 'error');
      }
    );
  };

  const triggerAlert = (msg, type = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(''), 5000);
  };

  // Submit Profile edits
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/teachers/profile', {
        name,
        phone,
        subjects,
        classes,
        fees,
        timings,
        qualification,
        experience,
        mode,
        address,
        villageOrArea: teachingArea,
        teachingArea,
        locality,
        city,
        state,
        demoAvailable,
        coordinates
      });
      triggerAlert(t('dashboard.teacher.saveProfileBtn'), 'success');
      fetchTeacherProfile();
    } catch (err) {
      triggerAlert('Failed to update profile details.', 'error');
    }
  };

  // Mark student attendance
  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    if (!attStudentName) return;
    try {
      await axios.post('/api/classes/attendance', {
        studentName: attStudentName,
        date: attDate,
        status: attStatus
      });
      triggerAlert(t('dashboard.teacher.attendanceHeading'), 'success');
      setAttStudentName('');
      fetchAttendanceRecords();
    } catch (err) {
      triggerAlert('Failed to mark student attendance log.', 'error');
    }
  };

  const handleAttendanceDelete = async (id) => {
    try {
      await axios.delete(`/api/classes/attendance/${id}`);
      fetchAttendanceRecords();
    } catch (err) {
      console.error(err);
    }
  };

  // Log monthly payment record (Upgraded Ledger Invoicing)
  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    if (!feeEnrollmentId || !feeAmount || !feeMonth) {
      triggerAlert('Please fill in all required fields.', 'error');
      return;
    }
    try {
      await axios.post('/api/enrollments/fees', {
        enrollmentId: feeEnrollmentId,
        amount: Number(feeAmount),
        month: feeMonth,
        status: feeStatus,
        dueDate: feeDueDate,
        dueAmount: Number(feeDueAmount)
      });
      triggerAlert(
        i18n.language === 'hi' ? 'ट्यूशन शुल्क चालान सफलतापूर्वक पंजीकृत किया गया।' : 'Monthly tuition invoice registered successfully!',
        'success'
      );
      setFeeEnrollmentId('');
      setFeeAmount('');
      setFeeDueAmount(0);
      fetchFeeRecords();
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to generate billing invoice.', 'error');
    }
  };

  const handleFeeDelete = async (id) => {
    try {
      await axios.delete(`/api/classes/fees/${id}`);
      fetchFeeRecords();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate dynamic stats from states
  const totalStudents = enrollments.length;
  const activeStudents = enrollments.filter(e => e.status === 'active').length;
  
  // Calculate pending fees as the sum of unpaid fee records
  const pendingFees = feeRecords
    .filter(f => f.status === 'unpaid')
    .reduce((sum, f) => sum + (f.amount || 0), 0);
  
  const totalCollections = feeRecords
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const totalAttendanceLogs = attendanceRecords.length;
  const presentAttendanceLogs = attendanceRecords.filter(a => a.status === 'present').length;
  const averageAttendance = totalAttendanceLogs > 0 
    ? Math.round((presentAttendanceLogs / totalAttendanceLogs) * 100) 
    : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Alert popup */}
      {alertMsg && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-lg border flex items-center space-x-2 text-sm font-semibold transition-all ${
          alertType === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          <AlertCircle size={18} />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden mb-8 shadow-premium">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="bg-brand-500/20 border border-brand-500/30 text-brand-300 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
            Educator Panel
          </span>
          <h1 className="font-outfit font-black text-3xl">
            {t('dashboard.welcome', { name: name || user?.name })}
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-medium">
            {t('dashboard.teacher.title')}
          </p>
        </div>
      </div>

      {/* Grid: Sidebar Tabs Navigation & Tab Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Navigation (Col 3) */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center space-x-3 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
            }`}
          >
            <User size={18} />
            <span>{t('dashboard.sidebar.profile')}</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center space-x-3 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
            }`}
          >
            <Users size={18} />
            <span>{i18n.language === 'hi' ? 'छात्र प्रबंधन' : 'Student Management'}</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center space-x-3 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
            }`}
          >
            <ClipboardCheck size={18} />
            <span>{t('dashboard.sidebar.attendance')}</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center space-x-3 cursor-pointer ${
              activeTab === 'fees'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
            }`}
          >
            <DollarSign size={18} />
            <span>{t('dashboard.sidebar.fees')}</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center space-x-3 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
            }`}
          >
            <UserPlus size={18} />
            <span>{i18n.language === 'hi' ? 'छात्र प्रवेश अनुरोध' : 'Tuition Join Requests'}</span>
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center space-x-3 cursor-pointer ${
              activeTab === 'classroom'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
            }`}
          >
            <BookOpen size={18} />
            <span>{i18n.language === 'hi' ? 'ट्यूशन क्लासरूम हब' : 'Classroom Hub'}</span>
          </button>

          {/* Educator Connection Code Card */}
          {connectionCode && (
            <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4 mt-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-cyan-400">Class Connection Code</p>
                <h4 className="font-outfit font-black text-lg tracking-tight select-all">{connectionCode}</h4>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(connectionCode);
                    triggerAlert('Teacher Connection Code copied to clipboard!', 'success');
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all font-bold text-[10px] cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>Copy Code</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=Join%20my%20tuition%20classroom%20on%20GuruConnect%20using%20my%20Teacher%20Connection%20Code:%20${connectionCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all flex items-center justify-center"
                  title="Share on WhatsApp"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 2a9.967 9.967 0 0 0-9.969 9.97 9.919 9.919 0 0 0 1.543 5.312l-1.605 5.86 6.002-1.574A9.918 9.918 0 0 0 12.03 22c5.503 0 9.971-4.469 9.971-9.97S17.533 2 12.031 2zm6.273 14.143c-.256.718-1.5 1.4-2.052 1.455-.494.05-1.127.247-3.3-.603-2.78-1.087-4.578-3.905-4.717-4.09-.138-.184-1.12-1.48-1.12-2.825 0-1.344.7-2.003.948-2.27.247-.267.545-.333.727-.333.181 0 .363.006.52.017.162.011.38.006.585.505.208.505.71 1.728.772 1.854.062.127.104.275.02.443-.083.167-.125.267-.25.413-.125.147-.26.33-.372.44-.127.126-.26.262-.113.514.147.25.653 1.077 1.4 1.742.964.858 1.77 1.126 2.022 1.253.25.127.397.106.545-.062.147-.168.629-.733.797-.983.169-.25.337-.208.564-.125.228.083 1.442.678 1.69 1.8.247.123.247.208.123.553z" />
                  </svg>
                </a>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="py-2.5 px-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all flex items-center justify-center cursor-pointer"
                  title="Generate QR Code"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column Content Panels (Col 9) */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: Profile Manager */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-outfit font-extrabold text-xl text-slate-900">
                  {t('dashboard.teacher.profileTabTitle')}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {t('dashboard.teacher.profileHelpText')}
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                
                {/* Visual grid fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">{t('auth.nameLabel')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">{t('auth.phoneLabel')}</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">{t('discovery.subjectsTaught')}</label>
                    <input
                      type="text"
                      value={subjects}
                      onChange={(e) => setSubjects(e.target.value)}
                      placeholder={t('dashboard.teacher.subjectsPlaceholder')}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">{t('discovery.classesTaught')}</label>
                    <input
                      type="text"
                      value={classes}
                      onChange={(e) => setClasses(e.target.value)}
                      placeholder={t('dashboard.teacher.classesPlaceholder')}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">{t('discovery.feesLabel')}</label>
                    <input
                      type="number"
                      value={fees}
                      onChange={(e) => setFees(Number(e.target.value))}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">{t('discovery.timingsLabel')}</label>
                    <input
                      type="text"
                      value={timings}
                      onChange={(e) => setTimings(e.target.value)}
                      placeholder="e.g., 4:00 PM - 7:00 PM"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Qualifications:</label>
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g., B.Sc. Mathematics, B.Ed."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Years Experience:</label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value))}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">{t('dashboard.teacher.modeLabel')}</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none"
                    >
                      <option value="offline">Offline Only (Home Tuition)</option>
                      <option value="online">Online Only</option>
                      <option value="both">Both (Online and offline)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5 flex flex-col justify-end pb-3">
                    <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={demoAvailable}
                        onChange={(e) => setDemoAvailable(e.target.checked)}
                        className="h-5 w-5 accent-brand-500 rounded"
                      />
                      <span>{t('dashboard.teacher.demoLabel')}</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">
                      {i18n.language === 'hi' ? 'गाँव / शिक्षण क्षेत्र का नाम *' : 'Village / Teaching Area *'}
                    </label>
                    <input
                      type="text"
                      value={teachingArea}
                      onChange={(e) => setTeachingArea(e.target.value)}
                      required
                      placeholder="e.g. Kamardih, Topchanchi"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">
                      {i18n.language === 'hi' ? 'इलाका / ब्लॉक' : 'Locality / Sub-area'}
                    </label>
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Tundi, Maharajganj"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">
                      {i18n.language === 'hi' ? 'शहर / जिला *' : 'City / District *'}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="e.g. Dhanbad"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">
                      {i18n.language === 'hi' ? 'राज्य *' : 'State *'}
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      placeholder="e.g. Jharkhand"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400">{t('discovery.addressLabel')}</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="2"
                    placeholder="Provide full village, post, district address details..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white outline-none focus:border-brand-500 transition-all resize-none"
                  ></textarea>
                </div>

                {/* Map Coordinates Selector */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-outfit font-extrabold text-slate-800 text-base">Academy Map Location</h4>
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5">Lng: {coordinates[0].toFixed(5)}, Lat: {coordinates[1].toFixed(5)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGPSDetect}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Navigation size={12} className="text-[#f97316]" />
                      <span>{t('dashboard.teacher.gpsButton')}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 font-medium">
                    {t('dashboard.teacher.gpsManual')}
                  </p>

                  <div className="h-64 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
                    {coordinates && (
                      <MapContainer
                        center={[coordinates[1], coordinates[0]]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[coordinates[1], coordinates[0]]} icon={teacherIcon}></Marker>
                        <CoordinatePickerListener onLocationPick={setCoordinates} />
                      </MapContainer>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-outfit font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Save size={18} />
                  <span>Update Profile Location & Metadata</span>
                </button>

              </form>
            </div>
          )}

          {/* TAB 1.5: Advanced Student Management Panel */}
          {activeTab === 'students' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Dynamic Stats Banner Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                
                {/* Stat 1: Total Students */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-5 shadow-premium flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-brand-500/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-brand-50 rounded-2xl text-brand-600">
                      <Users size={18} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      {i18n.language === 'hi' ? 'कुल छात्र' : 'Total Students'}
                    </span>
                  </div>
                  <p className="font-outfit font-black text-2xl text-slate-900 mt-4 leading-none">{totalStudents}</p>
                </div>

                {/* Stat 2: Active Students */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-5 shadow-premium flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-emerald-50 rounded-2xl text-emerald-600">
                      <CheckCircle size={18} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      {i18n.language === 'hi' ? 'सक्रिय' : 'Active Students'}
                    </span>
                  </div>
                  <p className="font-outfit font-black text-2xl text-emerald-600 mt-4 leading-none">{activeStudents}</p>
                </div>

                {/* Stat 3: Pending Payments */}
                <div 
                  onClick={() => {
                    setActiveTab('fees');
                    setFeeFilter('unpaid');
                  }}
                  className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-5 shadow-premium flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-amber-400 hover:shadow-lg transition-all"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-amber-50 rounded-2xl text-amber-600">
                      <Clock size={18} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      {i18n.language === 'hi' ? 'लंबित शुल्क' : 'Pending Fees (₹)'}
                    </span>
                  </div>
                  <p className="font-outfit font-black text-2xl text-amber-600 mt-4 leading-none">₹{pendingFees}</p>
                </div>

                {/* Stat 4: Total Collections */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-5 shadow-premium flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-indigo-50 rounded-2xl text-indigo-600">
                      <DollarSign size={18} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      {i18n.language === 'hi' ? 'कुल संग्रह' : 'Total Revenue'}
                    </span>
                  </div>
                  <p className="font-outfit font-black text-2xl text-indigo-600 mt-4 leading-none">₹{totalCollections}</p>
                </div>

                {/* Stat 5: Average Attendance % */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-5 shadow-premium flex flex-col justify-between relative overflow-hidden group col-span-2 md:col-span-1">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500"></div>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-cyan-50 rounded-2xl text-cyan-600">
                      <Activity size={18} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      {i18n.language === 'hi' ? 'औसत उपस्थिति' : 'Avg Attendance'}
                    </span>
                  </div>
                  <p className="font-outfit font-black text-2xl text-cyan-600 mt-4 leading-none">{averageAttendance}%</p>
                </div>

              </div>

              {/* Advanced Student Tab Selector and Panel Wrapper */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                
                {/* Header Title and Help Text */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-outfit font-extrabold text-2xl text-slate-900">
                      {i18n.language === 'hi' ? 'ट्यूशन छात्र प्रबंधन' : 'Tuition Student Cohorts'}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      {i18n.language === 'hi'
                        ? 'अपने ऑनलाइन और ऑफलाइन बैच के छात्रों की सूचियों को प्रबंधित करें।'
                        : 'Organize tuition enrollees across Online Pending approvals, Active classes, and Manual Offline registers.'}
                    </p>
                  </div>
                </div>

                {/* Filter Subtabs Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                  <button
                    onClick={() => setStudentsFilter('active')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-2 border ${
                      studentsFilter === 'active'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-extrabold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle size={14} />
                    <span>{i18n.language === 'hi' ? 'सक्रिय छात्र' : 'Active Students'}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                      studentsFilter === 'active' ? 'bg-brand-200 text-brand-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {enrollments.filter(e => e.status === 'active').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setStudentsFilter('pending')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-2 border ${
                      studentsFilter === 'pending'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 font-extrabold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock size={14} />
                    <span>{i18n.language === 'hi' ? 'लंबित भुगतान' : 'Pending Approvals'}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                      studentsFilter === 'pending' ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {enrollments.filter(e => e.status === 'pending').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setStudentsFilter('add_manual')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-2 border ${
                      studentsFilter === 'add_manual'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-extrabold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle size={14} />
                    <span>{i18n.language === 'hi' ? 'ऑफलाइन छात्र जोड़ें' : 'Enroll Student Manually'}</span>
                  </button>
                </div>

                {/* Subtab Contents */}
                {studentsFilter === 'active' && (
                  <div className="space-y-4">
                    {enrollments.filter(e => e.status === 'active').length === 0 ? (
                      <div className="text-center py-16 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center space-y-3">
                        <span className="text-4xl text-slate-300">👥</span>
                        <p className="text-slate-500 font-bold text-sm">
                          {i18n.language === 'hi' ? 'कोई सक्रिय छात्र नहीं मिले।' : 'No active students in your roster.'}
                        </p>
                        <p className="text-slate-400 text-xs font-semibold">
                          {i18n.language === 'hi' 
                            ? 'नए छात्रों को मैन्युअल रूप से जोड़ें या लंबित प्रवेशों की पुष्टि करें।'
                            : 'Manually add offline students or confirm tuition payments for pending requests.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {enrollments
                          .filter(e => e.status === 'active')
                          .map((record) => {
                            const joinDate = new Date(record.joiningDate).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            });
                            
                            return (
                              <div key={record._id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-premium hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-brand-500/10 to-indigo-500/10 rounded-full blur-2xl opacity-40 pointer-events-none"></div>
                                
                                <div className="space-y-4">
                                  {/* Student Meta Header */}
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 shadow-sm text-slate-400">
                                        {getProfilePhotoUrl(record.student?.user?.profilePhoto || record.student?.user?.profileImage || record.student?.profilePhoto || record.student?.profileImage) ? (
                                          <img 
                                            src={getProfilePhotoUrl(record.student?.user?.profilePhoto || record.student?.user?.profileImage || record.student?.profilePhoto || record.student?.profileImage)} 
                                            alt={record.name} 
                                            className="h-full w-full object-cover" 
                                            onError={handleProfileImageError}
                                          />
                                        ) : (
                                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="font-outfit font-black text-slate-800 text-base leading-tight group-hover:text-brand-600 transition-colors">
                                          {record.name}
                                        </h4>
                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                                          {i18n.language === 'hi' ? `कक्षा: ${record.class}` : `Class: ${record.class}`}
                                        </p>
                                      </div>
                                    </div>
                                    <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                      record.type === 'manual' 
                                        ? 'bg-slate-100 text-slate-600 border border-slate-200' 
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    }`}>
                                      {record.type === 'manual' ? (i18n.language === 'hi' ? 'ऑफलाइन' : 'Manual') : (i18n.language === 'hi' ? 'ऑनलाइन' : 'Online')}
                                    </span>
                                  </div>

                                  {/* Student details grid */}
                                  <div className="space-y-2 text-xs text-slate-500 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50 font-medium">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400 font-bold">{i18n.language === 'hi' ? 'विषय:' : 'Subject:'}</span>
                                      <span className="font-bold text-slate-800">{record.subject}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400 font-bold">{i18n.language === 'hi' ? 'मासिक शुल्क:' : 'Monthly Fees:'}</span>
                                      <span className="font-extrabold text-slate-900">₹{record.fees}</span>
                                    </div>
                                    {record.parentPhone && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-bold">{i18n.language === 'hi' ? 'अभिभावक संपर्क:' : 'Parent Contact:'}</span>
                                        <span className="font-mono text-slate-800 font-semibold">{record.parentPhone}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                      <span className="text-slate-400 font-bold">{i18n.language === 'hi' ? 'शामिल होने की तिथि:' : 'Enrolled Since:'}</span>
                                      <span className="text-slate-600 font-bold">{joinDate}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions row */}
                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
                                  <Link
                                    to={`/student-profile/${record._id}?mode=cohort`}
                                    className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-slate-700 hover:text-brand-600 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                                  >
                                    <Eye size={12} />
                                    <span>{i18n.language === 'hi' ? 'प्रोफ़ाइल एवं इतिहास' : 'View History & Profile'}</span>
                                  </Link>

                                  <button
                                    onClick={() => handleDeleteEnrollment(record._id)}
                                    className="p-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl transition-all active:scale-95 cursor-pointer"
                                    title={i18n.language === 'hi' ? 'छात्र निकालें' : 'Purge student record'}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                {studentsFilter === 'pending' && (
                  <div className="space-y-4">
                    {enrollments.filter(e => e.status === 'pending').length === 0 ? (
                      <div className="text-center py-16 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center space-y-3">
                        <span className="text-4xl text-slate-300">📬</span>
                        <p className="text-slate-500 font-bold text-sm">
                          {i18n.language === 'hi' ? 'कोई लंबित भुगतान स्वीकृति नहीं है।' : 'No pending admission approvals.'}
                        </p>
                        <p className="text-slate-400 text-xs font-semibold">
                          {i18n.language === 'hi' 
                            ? 'जब आप किसी अनुरोध को स्वीकार करते हैं, तो वे शुल्क पुष्टि के लिए यहाँ दिखाई देते हैं।'
                            : 'Accepted online tuition applications will queue here for parent tuition payment clearance.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {enrollments
                          .filter(e => e.status === 'pending')
                          .map((record) => {
                            const requestDate = new Date(record.joiningDate || record.createdAt).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            });

                            return (
                              <div key={record._id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-premium hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl opacity-30 pointer-events-none"></div>

                                <div className="space-y-4">
                                  {/* Student header row */}
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center font-outfit font-black text-amber-700 text-base shadow-sm">
                                        {record.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <h4 className="font-outfit font-black text-slate-800 text-base leading-tight">
                                          {record.name}
                                        </h4>
                                        <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                                          {i18n.language === 'hi' ? `कक्षा: ${record.class}` : `Class: ${record.class}`}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {i18n.language === 'hi' ? 'भुगतान लंबित' : 'Awaiting Fees'}
                                    </span>
                                  </div>

                                  {/* Details box */}
                                  <div className="space-y-2 text-xs text-slate-500 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50 font-medium">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400 font-bold">{i18n.language === 'hi' ? 'विषय:' : 'Subject:'}</span>
                                      <span className="font-bold text-slate-800">{record.subject}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400 font-bold">{i18n.language === 'hi' ? 'मासिक ट्यूशन शुल्क:' : 'Monthly Fee Standard:'}</span>
                                      <span className="font-extrabold text-slate-900">₹{record.fees}</span>
                                    </div>
                                    {record.parentPhone && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-bold">{i18n.language === 'hi' ? 'अभिभावक संपर्क:' : 'Parent Contact:'}</span>
                                        <span className="font-mono text-slate-800 font-semibold">{record.parentPhone}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                      <span className="text-slate-400 font-bold">{i18n.language === 'hi' ? 'अनुरोध तिथि:' : 'Accepted Request Date:'}</span>
                                      <span className="text-slate-600 font-bold">{requestDate}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions row */}
                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
                                  <button
                                    onClick={() => handleDeleteEnrollment(record._id)}
                                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl transition-all active:scale-95 cursor-pointer"
                                    title={i18n.language === 'hi' ? 'अस्वीकार करें' : 'Decline and Purge Request'}
                                  >
                                    <X size={15} />
                                  </button>

                                  <button
                                    onClick={() => handleMarkRequestPaid(record._id)}
                                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow hover:shadow-md transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer animate-pulse"
                                  >
                                    <Check size={14} />
                                    <span>{i18n.language === 'hi' ? 'शुल्क प्राप्त (Mark as Paid)' : 'Mark as Paid & Activate'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                {studentsFilter === 'add_manual' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-outfit font-extrabold text-base text-slate-800">
                        {i18n.language === 'hi' ? 'नया ऑफलाइन छात्र नामांकित करें' : 'Enroll New Offline Manual Student'}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                        {i18n.language === 'hi'
                          ? 'ट्यूशन में आने वाले स्थानीय / ऑफलाइन छात्रों को सीधे प्रबंधित करने के लिए जोड़ें।'
                          : 'Manually register local neighborhood kids attending your offline coaching cohorts.'}
                      </p>
                    </div>

                    <form onSubmit={handleManualStudentSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {i18n.language === 'hi' ? 'छात्र का नाम *' : 'Student Full Name *'}
                          </label>
                          <input
                            type="text"
                            value={manualName}
                            onChange={(e) => setManualName(e.target.value)}
                            required
                            placeholder="e.g. Aman Kumar"
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {i18n.language === 'hi' ? 'अभिभावक संपर्क नंबर' : 'Parent Contact Phone'}
                          </label>
                          <input
                            type="text"
                            value={manualParentPhone}
                            onChange={(e) => setManualParentPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {i18n.language === 'hi' ? 'कक्षा *' : 'Class / Standard *'}
                          </label>
                          <input
                            type="text"
                            value={manualClass}
                            onChange={(e) => setManualClass(e.target.value)}
                            required
                            placeholder="e.g. Class 10"
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {i18n.language === 'hi' ? 'ट्यूशन विषय *' : 'Tuition Subject *'}
                          </label>
                          <input
                            type="text"
                            value={manualSubject}
                            onChange={(e) => setManualSubject(e.target.value)}
                            required
                            placeholder="e.g. Mathematics"
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {i18n.language === 'hi' ? 'मासिक ट्यूशन शुल्क (₹) *' : 'Monthly Fee (₹) *'}
                          </label>
                          <input
                            type="number"
                            value={manualFees}
                            onChange={(e) => setManualFees(e.target.value)}
                            required
                            placeholder="e.g. 600"
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {i18n.language === 'hi' ? 'शामिल होने की तिथि' : 'Tuition Joining Date'}
                          </label>
                          <input
                            type="date"
                            value={manualJoiningDate}
                            onChange={(e) => setManualJoiningDate(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {i18n.language === 'hi' ? 'विशेष टिप्पणी (यदि कोई हो)' : 'Cohort Remarks / Notes'}
                        </label>
                        <textarea
                          value={manualNotes}
                          onChange={(e) => setManualNotes(e.target.value)}
                          rows="2"
                          placeholder="e.g. Needs extra support in Algebra, pays fee in cash..."
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white outline-none focus:border-brand-500 transition-all resize-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-brand-500 hover:from-indigo-600 hover:to-brand-600 text-white font-outfit font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <PlusCircle size={16} />
                        <span>{i18n.language === 'hi' ? 'ऑफलाइन छात्र को पंजीकृत करें' : 'Register Manual Offline Student'}</span>
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 2: Upgraded Daily Attendance Sheet Register */}
          {activeTab === 'attendance' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-outfit font-extrabold text-xl text-slate-900">
                    {i18n.language === 'hi' ? 'दैनिक उपस्थिति रजिस्टर' : 'Daily Attendance Register'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {i18n.language === 'hi' 
                      ? 'वर्तमान बैच के सक्रिय छात्रों की दैनिक उपस्थिति दर्ज करें।' 
                      : 'Log daily checkmarks and attendance status directly from active tuition cohorts.'}
                  </p>
                </div>
              </div>

              {/* Attendance Form */}
              <form onSubmit={handleSaveBulkAttendance} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {i18n.language === 'hi' ? 'चयनित उपस्थिति तिथि' : 'Selected Date'}
                    </label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-wrap gap-2 justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => handleBulkAttendancePreset('present')}
                      className="px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      {i18n.language === 'hi' ? 'सभी उपस्थित (Present All)' : 'Present All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkAttendancePreset('absent')}
                      className="px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
                    >
                      {i18n.language === 'hi' ? 'सभी अनुपस्थित (Absent All)' : 'Absent All'}
                    </button>
                  </div>
                </div>

                {/* Checklist Table */}
                <div className="space-y-4">
                  <h4 className="font-outfit font-extrabold text-sm text-slate-800">
                    {i18n.language === 'hi' ? 'सक्रिय छात्र उपस्थिति सूची' : 'Active Students Attendance List'}
                  </h4>

                  {enrollments.filter(e => e.status === 'active').length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 border border-slate-100 rounded-3xl text-xs">
                      {i18n.language === 'hi' 
                        ? 'कोई सक्रिय छात्र नहीं मिले। कृपया छात्र प्रबंधन टैब में छात्रों को नामांकित करें।' 
                        : 'No active students found in your roster. Please activate pending applicants or manually enroll offline students first.'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                            <th className="p-4">{i18n.language === 'hi' ? 'छात्र का नाम' : 'Student Name'}</th>
                            <th className="p-4">{i18n.language === 'hi' ? 'कक्षा' : 'Class'}</th>
                            <th className="p-4">{i18n.language === 'hi' ? 'विषय' : 'Subject'}</th>
                            <th className="p-4 text-center">{i18n.language === 'hi' ? 'चेक इन' : 'Check In'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {enrollments.filter(e => e.status === 'active').map((record) => {
                            const isPresent = attendanceStatuses[record._id] === 'present';
                            return (
                              <tr key={record._id} className="hover:bg-slate-50/50">
                                <td className="p-4 font-extrabold text-slate-900 flex items-center space-x-2">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                                    {record.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span>{record.name}</span>
                                  {record.type === 'manual' && (
                                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase font-extrabold">
                                      {i18n.language === 'hi' ? 'ऑफलाइन' : 'Manual'}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-slate-500">{record.class}</td>
                                <td className="p-4 text-slate-500">{record.subject}</td>
                                <td className="p-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleAttendanceCheckboxToggle(record._id)}
                                    className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 cursor-pointer border ${
                                      isPresent
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-rose-500 bg-rose-50 text-rose-700'
                                    }`}
                                  >
                                    {isPresent ? (
                                      <span className="flex items-center justify-center space-x-1">
                                        <CheckCircle size={12} />
                                        <span>{i18n.language === 'hi' ? 'उपस्थित' : 'Present'}</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center justify-center space-x-1">
                                        <X size={12} />
                                        <span>{i18n.language === 'hi' ? 'अनुपस्थित' : 'Absent'}</span>
                                      </span>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {enrollments.filter(e => e.status === 'active').length > 0 && (
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-outfit font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Save size={16} />
                    <span>{i18n.language === 'hi' ? 'दैनिक उपस्थिति रजिस्टर सहेजें' : 'Save Daily Attendance Register'}</span>
                  </button>
                )}
              </form>

              {/* Attendance Log History */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h4 className="font-outfit font-extrabold text-lg text-slate-800">
                  {i18n.language === 'hi' ? 'उपस्थिति इतिहास' : 'Daily Attendance History Log'}
                </h4>
                {attendanceRecords.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 font-medium bg-slate-50 rounded-3xl text-xs">
                    No attendance records logged yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                          <th className="p-4">{i18n.language === 'hi' ? 'छात्र का नाम' : 'Student Name'}</th>
                          <th className="p-4">{i18n.language === 'hi' ? 'तिथि' : 'Date'}</th>
                          <th className="p-4">{i18n.language === 'hi' ? 'स्थिति' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {attendanceRecords.slice(0, 15).map((record) => (
                          <tr key={record._id} className="hover:bg-slate-50/50">
<td className="p-4 font-extrabold text-slate-900">{record.studentName}</td>
                            <td className="p-4 font-bold text-slate-500">
                              {new Date(record.date).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase tracking-wider font-extrabold ${
                                record.status === 'present'
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                  : 'bg-rose-50 border-rose-100 text-rose-700'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Upgraded Invoices Bookkeeping Fee Ledger */}
          {activeTab === 'fees' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
              <div>
                <h3 className="font-outfit font-extrabold text-xl text-slate-900">
                  {i18n.language === 'hi' ? 'मासिक ट्यूशन फीस खाता बही' : 'Monthly Tuition Invoices Ledger'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {i18n.language === 'hi'
                    ? 'छात्रों के मासिक ट्यूशन शुल्क चालान, बकाया राशि और नियत तारीखों को प्रबंधित करें।'
                    : 'Manage monthly billing, payment clearances, due dates, and outstanding invoices for all active student accounts.'}
                </p>
              </div>

              {/* Form to bill students */}
              <form onSubmit={handleFeeSubmit} className="space-y-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                <h4 className="font-outfit font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                  {i18n.language === 'hi' ? 'नया शुल्क चालान जोड़ें' : 'Generate Monthly Tuition Invoice'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {i18n.language === 'hi' ? 'छात्र चुनें *' : 'Select Student *'}
                    </label>
                    <select
                      value={feeEnrollmentId}
                      onChange={(e) => {
                        setFeeEnrollmentId(e.target.value);
                        const selected = enrollments.find(x => x._id === e.target.value);
                        if (selected) {
                          setFeeAmount(selected.fees || '');
                        }
                      }}
                      required
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none"
                    >
                      <option value="">-- Choose Student --</option>
                      {enrollments.filter(e => e.status === 'active').map(e => (
                        <option key={e._id} value={e._id}>{e.name} ({e.class})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {i18n.language === 'hi' ? 'बिलिंग महीना *' : 'Billing Month *'}
                    </label>
                    <input
                      type="text"
                      value={feeMonth}
                      onChange={(e) => setFeeMonth(e.target.value)}
                      placeholder="e.g. May 2026"
                      required
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {i18n.language === 'hi' ? 'शुल्क राशि (₹) *' : 'Fee Amount (₹) *'}
                    </label>
                    <input
                      type="number"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      placeholder="₹500"
                      required
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {i18n.language === 'hi' ? 'नियुक्त भुगतान तिथि' : 'Due Date'}
                    </label>
                    <input
                      type="date"
                      value={feeDueDate}
                      onChange={(e) => setFeeDueDate(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {i18n.language === 'hi' ? 'बकाया नियत राशि (₹)' : 'Remaining Due Amount (₹)'}
                    </label>
                    <input
                      type="number"
                      value={feeDueAmount}
                      onChange={(e) => setFeeDueAmount(e.target.value)}
                      placeholder="₹0"
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setFeeStatus('paid')}
                      className={`py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 cursor-pointer border ${
                        feeStatus === 'paid'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {t('dashboard.teacher.paidStatus')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeeStatus('unpaid')}
                      className={`py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 cursor-pointer border ${
                        feeStatus === 'unpaid'
                          ? 'border-amber-500 bg-amber-50 text-amber-700 font-extrabold'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {t('dashboard.teacher.unpaidStatus')}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-2xl shadow active:scale-95 transition-all cursor-pointer mt-2"
                >
                  {i18n.language === 'hi' ? 'शुल्क चालान पंजीकृत करें' : 'Post Tuition Monthly Invoice'}
                </button>
              </form>

              {/* Monthly Ledger Bookkeeping table */}
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h4 className="font-outfit font-extrabold text-lg text-slate-800">
                    {i18n.language === 'hi' ? 'मासिक शुल्क बहीखाता विवरण' : 'Monthly Fee Ledger Registry'}
                  </h4>
                  
                  {/* Fee Ledger status filters */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFeeFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                        feeFilter === 'all'
                          ? 'bg-white text-slate-800 shadow-sm font-extrabold'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeeFilter('paid')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                        feeFilter === 'paid'
                          ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeeFilter('unpaid')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                        feeFilter === 'unpaid'
                          ? 'bg-amber-50 text-slate-800 shadow-sm font-extrabold'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Unpaid
                    </button>
                  </div>
                </div>
                
                {(() => {
                  const filteredFeeRecords = feeRecords.filter(f => {
                    if (feeFilter === 'all') return true;
                    return f.status === feeFilter;
                  });

                  if (filteredFeeRecords.length === 0) {
                    return (
                      <div className="p-6 text-center text-slate-400 font-medium bg-slate-50 rounded-3xl text-xs">
                        {feeFilter === 'unpaid' 
                          ? 'No unpaid invoices found. All clear!' 
                          : feeFilter === 'paid' 
                            ? 'No paid invoices found.' 
                            : 'No monthly student tuition fees logged yet.'}
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                            <th className="p-4">{t('dashboard.teacher.studentCol')}</th>
                            <th className="p-4">Month</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Due Date / Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {filteredFeeRecords.slice(0, 20).map((record) => {
                            const daysOverdue = record.status === 'unpaid' && record.dueDate ? (() => {
                              const due = new Date(record.dueDate);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              due.setHours(0, 0, 0, 0);
                              if (due >= today) return 0;
                              return Math.ceil(Math.abs(today - due) / (1000 * 60 * 60 * 24));
                            })() : 0;

                            return (
                              <tr key={record._id} className="hover:bg-slate-50/50">
                                <td className="p-4 font-extrabold text-slate-900">{record.studentName}</td>
                                <td className="p-4 text-slate-500 font-bold">{record.month}</td>
                                <td className="p-4 font-extrabold text-slate-900">₹{record.amount}</td>
                                <td className="p-4 text-slate-500 font-bold">
                                  {record.dueDate ? (
                                    <div>
                                      <p>{new Date(record.dueDate).toLocaleDateString()}</p>
                                      {daysOverdue > 0 && (
                                        <p className="text-rose-600 font-black text-[10px] mt-0.5">
                                          {daysOverdue} Days Overdue
                                        </p>
                                      )}
                                      {record.dueAmount > 0 && <p className="text-rose-500 font-bold text-[10px]">Due: ₹{record.dueAmount}</p>}
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 font-normal">--</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase tracking-wider font-extrabold ${
                                    record.status === 'paid'
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                      : 'bg-amber-50 border-amber-100 text-amber-700'
                                  }`}>
                                    {record.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right inline-flex items-center space-x-2">
                                  {record.status === 'paid' && (
                                    <button
                                      onClick={() => {
                                        const teacherData = {
                                          user: { name: name || user?.name, phone: phone || user?.phone },
                                          address,
                                          villageOrArea: villageOrArea || teachingArea,
                                          locality
                                        };
                                        downloadReceiptPdf(record, teacherData);
                                      }}
                                      className="p-2 hover:bg-emerald-50 text-emerald-600 border border-emerald-100 hover:border-emerald-200 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                                      title={i18n.language === 'hi' ? 'रसीद डाउनलोड करें' : 'Download Receipt'}
                                    >
                                      <Download size={14} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleFeeDelete(record._id)}
                                    className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors cursor-pointer"
                                    title={t('dashboard.teacher.deleteBtn')}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          {activeTab === 'requests' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-outfit font-extrabold text-2xl text-slate-900">
                    {i18n.language === 'hi' ? 'ट्यूशन में शामिल होने के अनुरोध' : 'Student Tuition Join Requests'}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {i18n.language === 'hi' 
                      ? 'अपने कोचिंग बैच में शामिल होने के लिए स्थानीय छात्रों के अनुरोध प्रबंधित करें।' 
                      : 'Review and accept/reject direct admission requests from neighborhood students.'}
                  </p>
                </div>
              </div>

              {/* Sub-Filters Tabs Row */}
              <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                <button
                  onClick={() => setRequestFilter('pending')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-2 border ${
                    requestFilter === 'pending'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 font-extrabold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Inbox size={14} />
                  <span>{i18n.language === 'hi' ? 'लंबित' : 'Pending'}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    requestFilter === 'pending' ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                </button>

                <button
                  onClick={() => setRequestFilter('accepted')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-2 border ${
                    requestFilter === 'accepted'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Check size={14} />
                  <span>{i18n.language === 'hi' ? 'स्वीकृत छात्र' : 'Accepted Cohort'}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    requestFilter === 'accepted' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {requests.filter(r => r.status === 'accepted').length}
                  </span>
                </button>

                <button
                  onClick={() => setRequestFilter('rejected')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-2 border ${
                    requestFilter === 'rejected'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 font-extrabold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <X size={14} />
                  <span>{i18n.language === 'hi' ? 'अस्वीकृत' : 'Rejected'}</span>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    requestFilter === 'rejected' ? 'bg-rose-200 text-rose-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {requests.filter(r => r.status === 'rejected').length}
                  </span>
                </button>
              </div>

              {/* Request Cards Grid */}
              {requests.filter(r => r.status === requestFilter).length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center space-y-3">
                  <span className="text-4xl text-slate-300">📬</span>
                  <p className="text-slate-500 font-bold text-sm">
                    {i18n.language === 'hi' 
                      ? `${requestFilter === 'pending' ? 'कोई लंबित' : requestFilter === 'accepted' ? 'कोई स्वीकृत' : 'कोई अस्वीकृत'} प्रवेश अनुरोध नहीं है।`
                      : `No ${requestFilter} admission requests found.`}
                  </p>
                  <p className="text-slate-400 text-xs font-semibold">
                    {i18n.language === 'hi' 
                      ? 'जब कोई छात्र आपके लिए अनुरोध भेजेगा, तो वह यहाँ दिखाई देगा।' 
                      : 'New applications from neighborhood children will reflect in this tray.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requests
                    .filter(r => r.status === requestFilter)
                    .map((r) => {
                      const studentName = r.student?.user?.name || 'Local Student';
                      const studentClass = r.student?.class || 'Not Specified';
                      const parentContact = r.parentPhone || r.student?.user?.phone || 'Not Shared';
                      const requestDate = new Date(r.createdAt).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      });

                      return (
                        <div 
                          key={r._id} 
                          className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
                        >
                          {/* Accent corner decorative marker */}
                          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none ${
                            requestFilter === 'pending' ? 'bg-amber-500' : requestFilter === 'accepted' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}></div>

                          <div className="space-y-4">
                            {/* Card Top Row */}
                            <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 shadow-sm text-slate-400">
                                  {getProfilePhotoUrl(r.student?.user?.profilePhoto || r.student?.user?.profileImage || r.student?.profilePhoto || r.student?.profileImage) ? (
                                    <img 
                                      src={getProfilePhotoUrl(r.student?.user?.profilePhoto || r.student?.user?.profileImage || r.student?.profilePhoto || r.student?.profileImage)} 
                                      alt={studentName} 
                                      className="h-full w-full object-cover" 
                                      onError={handleProfileImageError}
                                    />
                                  ) : (
                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-outfit font-black text-slate-800 text-base leading-tight group-hover:text-brand-600 transition-colors">
                                    {studentName}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                                    {i18n.language === 'hi' ? `कक्षा: ${studentClass}` : `Class: ${studentClass}`}
                                  </p>
                                </div>
                              </div>

                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                                <Clock size={11} className="text-slate-400" />
                                <span>{requestDate}</span>
                              </span>
                            </div>

                            {/* Details Details Grid */}
                            <div className="space-y-2.5 text-xs text-slate-500 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50 font-medium">
                              <div className="flex items-center space-x-2">
                                <BookOpen size={13} className="text-[#f97316]" />
                                <span>
                                  <strong className="text-slate-600">{i18n.language === 'hi' ? 'विषय रुचि:' : 'Interested Subject:'} </strong>
                                  <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                    {r.subject}
                                  </span>
                                </span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Phone size={13} className="text-emerald-500" />
                                <span>
                                  <strong className="text-slate-600">{i18n.language === 'hi' ? 'अभिभावक संपर्क:' : 'Parent Contact:'} </strong>
                                  <span className="font-mono font-semibold">{parentContact}</span>
                                </span>
                              </div>

                              {r.message && (
                                <div className="flex items-start space-x-2 mt-1 pt-2 border-t border-slate-100/60">
                                  <MessageSquare size={13} className="text-indigo-400 mt-0.5 shrink-0" />
                                  <p className="italic text-slate-500 text-[11px] leading-relaxed">
                                    "{r.message}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Action Row */}
                          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100/80 mt-4">
                            {r.student?._id ? (
                              <Link
                                to={`/student-profile/${r.student._id}`}
                                className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                              >
                                <Eye size={12} />
                                <span>{i18n.language === 'hi' ? 'प्रोफ़ाइल जांचें' : 'Evaluate Profile'}</span>
                              </Link>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold italic">
                                {i18n.language === 'hi' ? 'प्रोफ़ाइल अनुपलब्ध' : 'Profile Unlinked'}
                              </span>
                            )}

                            {r.status === 'pending' && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleRejectRequest(r._id)}
                                  className="p-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl transition-all active:scale-95 cursor-pointer"
                                  title={i18n.language === 'hi' ? 'अनुरोध अस्वीकार करें' : 'Decline request'}
                                >
                                  <X size={15} />
                                </button>
                                <button
                                  onClick={() => handleAcceptRequest(r._id)}
                                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow hover:shadow-md transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                                >
                                  <Check size={14} />
                                  <span>{i18n.language === 'hi' ? 'स्वीकार करें' : 'Accept'}</span>
                                </button>
                              </div>
                            )}

                            {r.status === 'accepted' && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center space-x-1 animate-pulse">
                                <Check size={12} />
                                <span>{i18n.language === 'hi' ? 'बैच में शामिल' : 'Enrolled'}</span>
                              </span>
                            )}

                            {r.status === 'rejected' && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl flex items-center space-x-1">
                                <X size={12} />
                                <span>{i18n.language === 'hi' ? 'अस्वीकृत' : 'Rejected'}</span>
                              </span>
                            )}
                          </div>

                        </div>
                      );
                    })}
                </div>
              )}

            </div>
          )}

          {/* TAB 6: Classroom Hub */}
          {activeTab === 'classroom' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
              <div>
                <h3 className="font-outfit font-extrabold text-2xl text-slate-900">
                  {i18n.language === 'hi' ? 'ट्यूशन क्लासरूम हब' : 'Tuition Classroom Hub'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {i18n.language === 'hi'
                    ? 'अध्ययन नोट्स साझा करें, शंकाओं का समाधान करें, गृहकार्य दें और घोषणाएं प्रकाशित करें।'
                    : 'Share study notes, resolve student doubts, post homework tasks, and publish announcements.'}
                </p>
              </div>

              {/* Classroom Hub Sub-Tabs Selectors */}
              <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                {[
                  { id: 'notes', label: i18n.language === 'hi' ? 'अध्ययन नोट्स' : 'Study Notes' },
                  { id: 'doubts', label: i18n.language === 'hi' ? 'छात्र शंकाएं' : 'Student Doubts' },
                  { id: 'homework', label: i18n.language === 'hi' ? 'गृहकार्य' : 'Homework Task' },
                  { id: 'announcements', label: i18n.language === 'hi' ? 'घोषणाएं' : 'Announcements' },
                  { id: 'connections', label: i18n.language === 'hi' ? 'कोड कनेक्शन' : 'Code Connections' }
                ].map(subTab => (
                  <button
                    key={subTab.id}
                    onClick={() => setClassroomHubTab(subTab.id)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer border ${
                      classroomHubTab === subTab.id
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-extrabold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* Classroom Sub-Tab 1: Study Notes */}
              {classroomHubTab === 'notes' && (
                <div className="space-y-6">
                  {/* Upload Note Form */}
                  <form onSubmit={handleNoteSubmit} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                    <h4 className="font-outfit font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                      Upload New Study Note
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Note Title *</label>
                        <input
                          type="text"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          placeholder="e.g. Trignometry Part 1 Formula Sheet"
                          required
                          className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-brand-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Note File URL / Link *</label>
                        <input
                          type="url"
                          value={noteFileUrl}
                          onChange={(e) => setNoteFileUrl(e.target.value)}
                          placeholder="e.g. https://drive.google.com/...pdf"
                          required
                          className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-brand-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Material Type</label>
                        <select
                          value={noteFileType}
                          onChange={(e) => setNoteFileType(e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-brand-500"
                        >
                          <option value="pdf">PDF Document</option>
                          <option value="image">Image Note</option>
                          <option value="assignment">Assignment / HW sheet</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-2xl shadow active:scale-95 transition-all cursor-pointer"
                    >
                      Publish Study Note
                    </button>
                  </form>

                  {/* List of uploaded notes */}
                  <div className="space-y-3">
                    <h4 className="font-outfit font-extrabold text-sm text-slate-800">Uploaded Study Materials</h4>
                    {uploadedNotes.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-xs">
                        No study notes published yet. Fill in the form above to share documents with your class.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {uploadedNotes.map(note => (
                          <div key={note._id} className="bg-white p-4 border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm hover:shadow transition-all">
                            <div className="space-y-1 truncate pr-3">
                              <span className="text-[9px] uppercase tracking-widest font-extrabold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                                {note.fileType}
                              </span>
                              <h5 className="font-outfit font-extrabold text-sm text-slate-800 truncate mt-1">{note.title}</h5>
                              <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-600 hover:underline flex items-center space-x-1">
                                <ExternalLink size={10} />
                                <span className="truncate">{note.fileUrl}</span>
                              </a>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleNoteDelete(note._id)}
                              className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Classroom Sub-Tab 2: Ask/Resolve Student Doubts */}
              {classroomHubTab === 'doubts' && (
                <div className="space-y-6">
                  {/* Reply doubt overlay form if active */}
                  {doubtReplyId && (
                    <form onSubmit={handleDoubtReplySubmit} className="bg-orange-50/50 p-5 rounded-3xl border border-orange-100 space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h4 className="font-outfit font-extrabold text-xs text-orange-700 uppercase tracking-wider">
                          Reply & Resolve Doubt
                        </h4>
                        <button type="button" onClick={() => setDoubtReplyId('')} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                          Cancel
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 font-semibold italic bg-white p-3 rounded-xl border border-orange-100">
                        "{doubts.find(d => d._id === doubtReplyId)?.question}"
                      </p>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Answer / Explanation *</label>
                        <textarea
                          value={doubtReplyAnswer}
                          onChange={(e) => setDoubtReplyAnswer(e.target.value)}
                          placeholder="Provide a detailed explanation or solution details..."
                          required
                          rows="3"
                          className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-orange-500"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-2xl shadow active:scale-95 transition-all cursor-pointer"
                      >
                        Publish Resolution Answer
                      </button>
                    </form>
                  )}

                  {/* List of student doubts */}
                  <div className="space-y-3">
                    <h4 className="font-outfit font-extrabold text-sm text-slate-800">Tuition Classroom Doubts Queue</h4>
                    {doubts.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-xs">
                        Classroom is clear! No doubts submitted by your connected students yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {doubts.map(doubt => (
                          <div key={doubt._id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-semibold">
                                  Asked by <strong className="text-slate-800">{doubt.student?.user?.name || 'Local Student'}</strong>
                                </p>
                                <h5 className="font-outfit font-extrabold text-slate-800 text-sm">Q: {doubt.question}</h5>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase tracking-wider font-extrabold ${
                                doubt.isResolved
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                  : 'bg-amber-50 border-amber-100 text-amber-700'
                              }`}>
                                {doubt.isResolved ? 'Resolved' : 'Pending Reply'}
                              </span>
                            </div>

                            {doubt.isResolved ? (
                              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-700">
                                <strong className="text-brand-600">A: </strong>
                                <span>{doubt.answer}</span>
                              </div>
                            ) : (
                              !doubtReplyId && (
                                <button
                                  type="button"
                                  onClick={() => setDoubtReplyId(doubt._id)}
                                  className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[10px] cursor-pointer"
                                >
                                  Reply to Doubt
                                </button>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Classroom Sub-Tab 3: Tuition Homework */}
              {classroomHubTab === 'homework' && (
                <div className="space-y-6">
                  {/* Create Homework Form */}
                  <form onSubmit={handleHomeworkSubmit} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                    <h4 className="font-outfit font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                      Generate New Homework Task
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Homework Title *</label>
                        <input
                          type="text"
                          value={hwTitle}
                          onChange={(e) => setHwTitle(e.target.value)}
                          placeholder="e.g. Solve Exercise 4.2 Questions 1-5"
                          required
                          className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-brand-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submission Deadline *</label>
                        <input
                          type="date"
                          value={hwDeadline}
                          onChange={(e) => setHwDeadline(e.target.value)}
                          required
                          className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Task Details & Description *</label>
                      <textarea
                        value={hwDescription}
                        onChange={(e) => setHwDescription(e.target.value)}
                        placeholder="Write details of questions, equations, or submission modes..."
                        required
                        rows="3"
                        className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-brand-500"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-2xl shadow active:scale-95 transition-all cursor-pointer"
                    >
                      Publish Homework Task
                    </button>
                  </form>

                  {/* List of homework */}
                  <div className="space-y-3">
                    <h4 className="font-outfit font-extrabold text-sm text-slate-800">Assigned Homework Grid</h4>
                    {homeworks.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-xs">
                        No homework assigned yet. Add tasks above to sync homework ledgers.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {homeworks.map(hw => (
                          <div key={hw._id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex justify-between items-start">
                            <div className="space-y-2 pr-3">
                              <div className="flex items-center space-x-2">
                                <h5 className="font-outfit font-extrabold text-slate-800 text-sm">{hw.title}</h5>
                                <span className="text-[9px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center space-x-0.5">
                                  <Clock size={10} />
                                  <span>Due: {new Date(hw.deadline).toLocaleDateString()}</span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{hw.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleHomeworkDelete(hw._id)}
                              className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Classroom Sub-Tab 4: Classroom Announcements */}
              {classroomHubTab === 'announcements' && (
                <div className="space-y-6">
                  {/* Create Announcement Form */}
                  <form onSubmit={handleAnnouncementSubmit} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                    <h4 className="font-outfit font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                      Post New Classroom Notice
                    </h4>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notice Heading *</label>
                      <input
                        type="text"
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="e.g. Holiday Notice - Eid Al-Adha"
                        required
                        className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-brand-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Announcement Details *</label>
                      <textarea
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        placeholder="Provide details about schedules, events, or class cancellations..."
                        required
                        rows="3"
                        className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-brand-500"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-2xl shadow active:scale-95 transition-all cursor-pointer"
                    >
                      Broadcast Announcement
                    </button>
                  </form>

                  {/* List of announcements */}
                  <div className="space-y-3">
                    <h4 className="font-outfit font-extrabold text-sm text-slate-800">Classroom Broadcast History Notice Board</h4>
                    {announcements.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-xs">
                        No announcement broadcasts yet. Share class notices above.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {announcements.map(ann => (
                          <div key={ann._id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex justify-between items-start">
                            <div className="space-y-2 pr-3">
                              <h5 className="font-outfit font-extrabold text-slate-800 text-sm">{ann.title}</h5>
                              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{ann.content}</p>
                              <span className="inline-block text-[9px] font-extrabold text-slate-400 font-sans">
                                Broadcast: {new Date(ann.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAnnouncementDelete(ann._id)}
                              className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors cursor-pointer shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Classroom Sub-Tab 5: Connection Code Connections list */}
              {classroomHubTab === 'connections' && (
                <div className="space-y-4">
                  <h4 className="font-outfit font-extrabold text-sm text-slate-800">Classroom Code Connection Requests</h4>
                  {teacherConnections.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-medium bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-xs">
                      No code connection records found. Students who enter your code will request connections here.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                            <th className="p-4">Student Name</th>
                            <th className="p-4">Contact Phone</th>
                            <th className="p-4">Requested Date</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {teacherConnections.map(conn => (
                            <tr key={conn._id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-extrabold text-slate-900">{conn.student?.user?.name || 'Local Student'}</td>
                              <td className="p-4 text-slate-500 font-bold">{conn.student?.user?.phone || 'Not Shared'}</td>
                              <td className="p-4 text-slate-500">
                                {new Date(conn.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase tracking-wider font-extrabold ${
                                  conn.status === 'accepted'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                    : conn.status === 'pending'
                                    ? 'bg-amber-50 border-amber-100 text-amber-700'
                                    : 'bg-rose-50 border-rose-100 text-rose-700'
                                }`}>
                                  {conn.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {conn.status === 'pending' ? (
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => handleConnectionResponse(conn._id, 'reject')}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95 cursor-pointer border border-rose-100"
                                      title="Reject"
                                    >
                                      <X size={12} />
                                    </button>
                                    <button
                                      onClick={() => handleConnectionResponse(conn._id, 'accept')}
                                      className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all active:scale-95 cursor-pointer"
                                      title="Accept"
                                    >
                                      <Check size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-300 font-normal">Resolved</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      {/* Teacher QR Code Generator Modal */}
      {showQrModal && connectionCode && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full mx-4 border border-slate-100 shadow-premium space-y-6 text-center animate-slide-up relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 font-extrabold text-sm outline-none cursor-pointer"
            >
              ✕
            </button>
            <div className="space-y-1">
              <h3 className="font-outfit font-black text-xl text-slate-900">Your Classroom QR Code</h3>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">GC Unique Scan ID</p>
            </div>
            
            <div className="flex justify-center p-4 bg-slate-50 border border-slate-100 rounded-3xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${connectionCode}`}
                alt="Teacher Connection QR Code"
                className="w-48 h-48 object-contain rounded-xl shadow-sm bg-white p-2"
              />
            </div>
            
            <div className="space-y-2">
              <span className="inline-block bg-slate-900 text-cyan-400 font-mono font-extrabold text-sm px-4 py-2 rounded-xl shadow-sm">
                {connectionCode}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-[240px] mx-auto">
                Ask your students to scan this QR code on their GuruConnect app to instantly connect to your class without typing.
              </p>
            </div>
            
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer border border-transparent"
            >
              Close QR Code
            </button>
          </div>
        </div>
      )}

      </div>

    </div>
  );
};

export default TeacherDashboard;
