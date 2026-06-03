import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getProfilePhotoUrl, handleProfileImageError } from '../utils/image';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, GraduationCap, School, 
  BookOpen, Award, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  
  // Cohort details states
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    fetchStudentProfile();
  }, [id, mode]);

  const fetchStudentProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (mode === 'cohort') {
        const { data } = await axios.get(`/api/enrollments/${id}/history`);
        setEnrollment(data.enrollment);
        setAttendance(data.attendance || []);
        setFees(data.fees || []);
        // Adapt standard fields so layout remains unbroken
        setStudent({
          class: data.enrollment.class,
          school: data.enrollment.type === 'manual' ? 'Offline Cohort' : 'Online Registration',
          address: data.enrollment.notes || 'No remarks provided.',
          user: {
            name: data.enrollment.name,
            phone: data.enrollment.parentPhone,
            email: data.enrollment.type === 'manual' ? 'offline@manual.student' : 'online@enrolled.student'
          }
        });
      } else {
        const { data } = await axios.get(`/api/requests/student-profile/${id}`);
        setStudent(data);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
      setErrorMsg(
        i18n.language === 'hi' 
          ? 'छात्र विवरण प्राप्त करने में विफल।' 
          : 'Failed to retrieve detailed student files.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">
            {i18n.language === 'hi' ? 'विवरण लोड हो रहा है...' : 'Evaluating Credentials...'}
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !student) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 font-sans">
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <AlertCircle size={28} />
          </div>
          <h3 className="font-outfit font-extrabold text-xl text-rose-950">
            {i18n.language === 'hi' ? 'त्रुटि हुई' : 'Access Restricted'}
          </h3>
          <p className="text-xs font-semibold text-rose-700 max-w-md mx-auto">
            {errorMsg || (i18n.language === 'hi' ? 'आपको इस छात्र प्रोफ़ाइल को देखने की अनुमति नहीं है।' : 'You do not have access authorization to review this student file.')}
          </p>
          <button
            onClick={() => navigate('/teacher')}
            className="mt-4 px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer inline-flex items-center space-x-2"
          >
            <ArrowLeft size={14} />
            <span>{i18n.language === 'hi' ? 'डैशबोर्ड पर वापस जाएं' : 'Return to Dashboard'}</span>
          </button>
        </div>
      </div>
    );
  }

  const { name, email, phone } = student.user || {};
  const firstLetter = name ? name.charAt(0).toUpperCase() : 'S';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-sans">
      
      {/* Back to Dashboard navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/teacher')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer bg-white border border-slate-100 px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={14} />
          <span>{i18n.language === 'hi' ? 'शिक्षक डैशबोर्ड पर लौटें' : 'Back to Teacher Dashboard'}</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-8 shadow-premium">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Avatar Block */}
          <div className="w-20 h-20 rounded-3xl bg-slate-800 border-4 border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {getProfilePhotoUrl(student?.profilePhoto || student?.profileImage || student?.user?.profilePhoto || student?.user?.profileImage) ? (
              <img src={getProfilePhotoUrl(student.profilePhoto || student.profileImage || student.user?.profilePhoto || student.user?.profileImage)} alt={name} className="h-full w-full object-cover" onError={handleProfileImageError} />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-800 text-slate-400">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Title Info */}
          <div className="text-center sm:text-left space-y-2.5">
            <span className="bg-brand-500/20 border border-brand-500/30 text-brand-300 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
              {i18n.language === 'hi' ? 'छात्र क्रेडेंशियल फ़ाइल' : 'Student Credential File'}
            </span>
            <h1 className="font-outfit font-black text-3xl">
              {name || 'Local Student'}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-1.5">
              <span className="text-[10px] bg-slate-800/80 border border-slate-700/60 font-bold px-3 py-1 rounded-lg flex items-center space-x-1">
                <GraduationCap size={12} className="text-cyan-400" />
                <span>{i18n.language === 'hi' ? `कक्षा: ${student.class || 'निर्दिष्ट नहीं'}` : `Class: ${student.class || 'Not specified'}`}</span>
              </span>
              {student.school && (
                <span className="text-[10px] bg-slate-800/80 border border-slate-700/60 font-bold px-3 py-1 rounded-lg flex items-center space-x-1">
                  <School size={12} className="text-[#f97316]" />
                  <span>{student.school}</span>
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main content grids */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Side: Core Metadata Details (Col 7) */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-outfit font-extrabold text-lg text-slate-900 border-b border-slate-100 pb-3">
              {i18n.language === 'hi' ? 'अकादमिक और स्थान प्रोफ़ाइल' : 'Academic & Locality Profile'}
            </h3>
          </div>

          <div className="space-y-5 font-semibold text-slate-700 text-sm">
            {/* School */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[#f97316]">
                <School size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  {i18n.language === 'hi' ? 'विद्यालय / संस्थान' : 'School / Institute'}
                </p>
                <p className="text-slate-800 text-sm font-bold">
                  {student.school || (i18n.language === 'hi' ? 'प्रदान नहीं किया गया' : 'Not Provided')}
                </p>
              </div>
            </div>

            {/* Class */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-cyan-500">
                <GraduationCap size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  {i18n.language === 'hi' ? 'वर्तमान कक्षा / मानक' : 'Current Class / Standard'}
                </p>
                <p className="text-slate-800 text-sm font-bold">
                  {student.class || (i18n.language === 'hi' ? 'निर्दिष्ट नहीं' : 'Not specified')}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-rose-500">
                <MapPin size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  {i18n.language === 'hi' ? 'इलाका / गाँव का नाम' : 'Locality / Village Name'}
                </p>
                <p className="text-slate-800 text-sm font-bold leading-snug">
                  {student.address || (i18n.language === 'hi' ? 'कोई स्थान विवरण उपलब्ध नहीं है' : 'No village/address logged.')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Parent Contacts and Connected Cohorts (Col 5) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Contact Details Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-outfit font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">
              {i18n.language === 'hi' ? 'अभिभावक और संपर्क जानकारी' : 'Parent & Student Contact'}
            </h4>

            <div className="space-y-3.5 font-semibold text-slate-700 text-xs">
              <div className="flex items-center space-x-3">
                <Phone size={14} className="text-emerald-500 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase tracking-wider">
                    {i18n.language === 'hi' ? 'फ़ोन नंबर' : 'Primary Phone'}
                  </span>
                  <span className="font-mono text-slate-800 text-xs font-bold">{phone || 'Not Shared'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail size={14} className="text-indigo-400 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase tracking-wider">
                    {i18n.language === 'hi' ? 'ईमेल पता' : 'Email ID'}
                  </span>
                  <span className="text-slate-800 text-xs font-bold">{email || 'Not Shared'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Roster Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-outfit font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">
              {i18n.language === 'hi' ? 'सक्रिय शिक्षक नेटवर्क' : 'Active Connected Cohorts'}
            </h4>

            {student.joinedTeachers && student.joinedTeachers.length > 0 ? (
              <div className="space-y-2">
                {student.joinedTeachers.map((teacher) => (
                  <div key={teacher._id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">{teacher.user?.name}</p>
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">
                        {teacher.user?.subjects?.join(', ') || teacher.subjects?.join(', ') || 'General'}
                      </p>
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                      {i18n.language === 'hi' ? 'सक्रिय' : 'Enrolled'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 font-medium text-xs bg-slate-50 rounded-2xl">
                {i18n.language === 'hi' ? 'वर्तमान में किसी भी स्थानीय कोचिंग से जुड़े नहीं हैं।' : 'Not currently enrolled in other nearby tuition academies.'}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Attendance and Fees Tables under Cohort Mode */}
      {mode === 'cohort' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          
          {/* Attendance sheet history */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-outfit font-extrabold text-lg text-slate-900">
                {i18n.language === 'hi' ? 'उपस्थिति रिपोर्ट' : 'Attendance Log History'}
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-xl">
                {i18n.language === 'hi' ? 'दर: ' : 'Rate: '}
                {attendance.length > 0
                  ? `${Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)}%`
                  : '100%'}
              </span>
            </div>

            {attendance.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl">
                No attendance checkmarks logged yet.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {attendance.map((log) => (
                  <div key={log._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="text-slate-500">
                      {new Date(log.date).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase tracking-wider font-extrabold ${
                      log.status === 'present'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`}>
                      {log.status === 'present' ? (i18n.language === 'hi' ? 'उपस्थित' : 'Present') : (i18n.language === 'hi' ? 'अनुपस्थित' : 'Absent')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fees invoices history ledger */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-outfit font-extrabold text-lg text-slate-900">
                {i18n.language === 'hi' ? 'शुल्क खाता बही' : 'Monthly Fees Ledger'}
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl">
                {i18n.language === 'hi' ? 'कुल भुगतान: ' : 'Paid: '}
                ₹{fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0)}
              </span>
            </div>

            {fees.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl">
                No billing invoices recorded yet.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {fees.map((invoice) => (
                  <div key={invoice._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col space-y-1.5 text-xs font-bold text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-800 text-sm font-extrabold">{invoice.month}</span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase tracking-wider font-extrabold ${
                        invoice.status === 'paid'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          : 'bg-amber-50 border-amber-100 text-amber-700'
                      }`}>
                        {invoice.status === 'paid' ? (i18n.language === 'hi' ? 'भुगतान हुआ' : 'Paid') : (i18n.language === 'hi' ? 'बकाया' : 'Unpaid')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{i18n.language === 'hi' ? 'शुल्क राशि: ' : 'Invoice Standard: '} ₹{invoice.amount}</span>
                      {invoice.dueDate && (
                        <span>
                          {i18n.language === 'hi' ? 'तिथि: ' : 'Due: '}
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {invoice.dueAmount > 0 && (
                      <p className="text-rose-500 font-bold text-[10px] text-right mt-0.5">
                        {i18n.language === 'hi' ? 'बकाया राशि: ' : 'Remaining Due: '} ₹{invoice.dueAmount}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default StudentProfile;
