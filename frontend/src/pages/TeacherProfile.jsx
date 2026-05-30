import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getProfilePhotoUrl } from '../utils/image';
import { ArrowLeft, MapPin, Award, CheckCircle, ShieldCheck, MessageCircle, AlertCircle, Sparkles, Send, X, Loader2, Clock } from 'lucide-react';
import StarRating from '../components/StarRating';

const TeacherProfile = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();

  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Join Request states
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [requestSubject, setRequestSubject] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [joinSuccessMsg, setJoinSuccessMsg] = useState('');
  const [joinErrorMsg, setJoinErrorMsg] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // null, 'pending', 'accepted', 'rejected'

  useEffect(() => {
    fetchProfileAndReviews();
  }, [id]);

  const fetchProfileAndReviews = async () => {
    setLoading(true);
    try {
      const profileRes = await axios.get(`/api/teachers/profile/${id}`);
      setTeacher(profileRes.data);

      const reviewsRes = await axios.get(`/api/teachers/reviews/${id}`);
      setReviews(reviewsRes.data);

      // Fetch request status if user is a student
      if (user && user.role === 'student') {
        const { data } = await axios.get('/api/requests/student');
        const req = data.find(r => (r.teacher?._id || r.teacher) === id);
        if (req) {
          setRequestStatus(req.status);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!comment) {
      setErrorMsg(t('discovery.commentLabel'));
      return;
    }

    setReviewLoading(true);
    try {
      await axios.post(`/api/teachers/review/${id}`, { rating, comment });
      setSuccessMsg(t('discovery.successReview'));
      setComment('');
      setRating(5);
      // Refresh
      fetchProfileAndReviews();
    } catch (err) {
      const localizedError = typeof err.response?.data?.message === 'object'
        ? (i18n.language === 'hi' ? err.response.data.message.hi : err.response.data.message.en)
        : 'Failed to post review';
      setErrorMsg(localizedError);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setJoinErrorMsg('');
    setJoinSuccessMsg('');

    if (!requestSubject) {
      setJoinErrorMsg(i18n.language === 'hi' ? 'कृपया एक विषय चुनें' : 'Please select a subject');
      return;
    }

    setSendingRequest(true);
    try {
      await axios.post('/api/requests/join', {
        teacherId: id,
        subject: requestSubject,
        parentPhone,
        message: requestMessage
      });
      setJoinSuccessMsg(
        i18n.language === 'hi'
          ? 'आपका शामिल होने का अनुरोध सफलतापूर्वक भेजा गया!'
          : 'Your join request was sent successfully!'
      );
      setRequestMessage('');
      setParentPhone('');
      setRequestSubject('');
      setRequestStatus('pending');
      setTimeout(() => setShowJoinModal(false), 2000);
    } catch (err) {
      const localizedErr = typeof err.response?.data?.message === 'object'
        ? (i18n.language === 'hi' ? err.response.data.message.hi : err.response.data.message.en)
        : 'Failed to send request';
      setJoinErrorMsg(localizedErr);
    } finally {
      setSendingRequest(false);
    }
  };

  // Helper: Active Badge calculation
  const getActiveBadgeDetails = (lastActiveDate) => {
    if (!lastActiveDate) return { label: t('discovery.activeBadges.inactive'), color: 'bg-slate-100 text-slate-600' };
    const diff = Date.now() - new Date(lastActiveDate).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    if (diff < oneDay) {
      return { label: t('discovery.activeBadges.today'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    } else if (diff < sevenDays) {
      return { label: t('discovery.activeBadges.week'), color: 'bg-blue-50 text-blue-700 border-blue-200' };
    } else {
      return { label: t('discovery.activeBadges.inactive'), color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div className="shimmer rounded-3xl h-64"></div>
        <div className="shimmer rounded-2xl h-44"></div>
        <div className="shimmer rounded-2xl h-44"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <Link to="/nearby" className="text-brand-600 font-bold hover:underline">Return to Search</Link>
      </div>
    );
  }

  const badge = getActiveBadgeDetails(teacher.lastActive);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      
      {/* Return Button */}
      <Link to="/nearby" className="inline-flex items-center space-x-2 text-slate-500 hover:text-slate-900 font-bold mb-6 group transition-colors">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Return to discovery map</span>
      </Link>

      {/* Profile Header Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-premium bg-white mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Avatar */}
          <div className="h-24 w-24 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {getProfilePhotoUrl(teacher.profilePhoto || teacher.profileImage || teacher.user?.profilePhoto || teacher.user?.profileImage) ? (
              <img src={getProfilePhotoUrl(teacher.profilePhoto || teacher.profileImage || teacher.user?.profilePhoto || teacher.user?.profileImage)} alt={teacher.user.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h1 className="font-outfit font-extrabold text-2xl sm:text-3xl text-slate-900 truncate">
                {teacher.user.name}
              </h1>
              
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                {teacher.isVerified && (
                  <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck size={12} />
                    <span>Verified</span>
                  </span>
                )}
                <span className={`border text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            </div>

            {/* Ratings Summary */}
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <StarRating rating={teacher.rating} size={16} />
              <span className="text-sm font-bold text-slate-800">{teacher.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-500 font-semibold">({teacher.reviewCount} reviews)</span>
            </div>

            {/* Address */}
            <p className="text-sm font-semibold text-slate-500 flex items-center justify-center sm:justify-start gap-1">
              <MapPin size={15} className="text-[#f97316]" />
              <span>
                {teacher.villageOrArea ? `[${teacher.villageOrArea}] ` : ''}
                {teacher.address}
              </span>
            </p>
          </div>

          {/* Highlight Badge */}
          <div className="bg-brand-50 border border-brand-100 p-4 rounded-2xl flex-shrink-0 text-center w-full sm:w-auto flex flex-col justify-between items-center gap-2.5">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Fees</p>
              <p className="font-outfit font-black text-2xl text-brand-600 mt-1">₹{teacher.fees}</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">({teacher.mode} classes)</p>
            </div>
            {user && user.role === 'student' && (
              <div className="w-full mt-1">
                {requestStatus === 'pending' && (
                  <button
                    disabled
                    className="w-full bg-amber-500/20 text-amber-700 border border-amber-200 font-extrabold text-[11px] px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 opacity-90 cursor-not-allowed"
                  >
                    <Clock size={13} className="animate-pulse text-amber-600" />
                    <span>{i18n.language === 'hi' ? 'अनुरोध भेजा गया' : 'Request Sent'}</span>
                  </button>
                )}

                {requestStatus === 'accepted' && (
                  <button
                    disabled
                    className="w-full bg-emerald-500 text-white font-extrabold text-[11px] px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm opacity-95 cursor-not-allowed"
                  >
                    <CheckCircle size={13} />
                    <span>{i18n.language === 'hi' ? 'शामिल हुए' : 'Joined'}</span>
                  </button>
                )}

                {requestStatus === 'rejected' && (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-[11px] px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🔄</span>
                    <span>{i18n.language === 'hi' ? 'अनुरोध पुनः भेजें' : 'Send Request Again'}</span>
                  </button>
                )}

                {!requestStatus && (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1 mt-1"
                  >
                    <span>➕</span>
                    <span>{i18n.language === 'hi' ? 'ट्यूशन में शामिल हों' : 'Request to Join'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Profile Grid Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100 text-sm font-medium text-slate-600">
          <div className="space-y-3">
            <p className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 w-28 shrink-0">{t('discovery.subjectsTaught')}</span>
              <span className="truncate">{teacher.subjects.join(', ')}</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 w-28 shrink-0">{t('discovery.classesTaught')}</span>
              <span className="truncate">{teacher.classes.join(', ')}</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 w-28 shrink-0">{t('discovery.timingsLabel')}</span>
              <span>{teacher.timings}</span>
            </p>
          </div>
          <div className="space-y-3">
            <p className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 w-28 shrink-0">Qualification:</span>
              <span>{teacher.qualification}</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 w-28 shrink-0">Experience:</span>
              <span>{teacher.experience} Years</span>
            </p>
            <p className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 w-28 shrink-0">Demo Class:</span>
              <span className="font-bold text-emerald-600">{teacher.demoAvailable ? 'Available / उपलब्ध' : 'On Request / अनुरोध पर'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        
        {/* Reviews List (Col 7) */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="font-outfit font-extrabold text-2xl text-slate-900">{t('discovery.reviewsHeading')}</h3>
          
          {reviews.length === 0 ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center text-slate-400 font-medium">
              {t('discovery.reviewsEmpty')}
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-5 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-slate-800 text-sm">{review.studentName}</h5>
                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <StarRating rating={review.rating} size={12} />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Review Form (Col 5) - Restricted to Student Role */}
        <div className="md:col-span-5">
          {user && user.role === 'student' ? (
            <div className="glass-card p-6 rounded-3xl border border-slate-100 shadow-sm bg-white space-y-4">
              <h4 className="font-outfit font-extrabold text-xl text-slate-900 flex items-center gap-1">
                <span>📝</span>
                <span>{t('discovery.writeReview')}</span>
              </h4>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl flex items-center space-x-1.5 text-xs font-semibold">
                    <AlertCircle size={15} />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-xl flex items-center space-x-1.5 text-xs font-semibold">
                    <span>✅ {successMsg}</span>
                  </div>
                )}

                {/* Rating selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    {t('discovery.ratingLabel')}
                  </label>
                  <StarRating rating={rating} size={24} interactive={true} onRatingChange={setRating} />
                </div>

                {/* Comment Text */}
                <div className="space-y-1">
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide friendly, transparent feedback on attendance punctuality and teaching clarity..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white outline-none focus:border-brand-500 transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
                >
                  <Send size={12} />
                  <span>{t('discovery.submitReview')}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl text-center text-xs font-bold text-slate-500">
              🔒 Log in as a Student / Parent to leave transparent feedback and rate this teacher.
            </div>
          )}
        </div>

      </div>

      {/* Startup Futuristic Placeholders Showcase */}
      <div className="space-y-4 pt-8 border-t border-slate-200">
        <h4 className="font-outfit font-black text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
          <Sparkles size={18} className="text-[#f97316]" />
          <span>GuruConnect Innovation Hub 🇮🇳</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* WhatsApp Direct Chat */}
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-3xl flex items-start space-x-3.5 relative overflow-hidden group">
            <span className="text-2xl p-2.5 bg-emerald-50 rounded-2xl">💬</span>
            <div className="space-y-1">
              <h5 className="font-bold text-emerald-800 text-sm">{t('placeholders.whatsappLabel')}</h5>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{t('placeholders.whatsappDesc')}</p>
            </div>
          </div>

          {/* AI Matchmaker */}
          <div className="p-5 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-3xl flex items-start space-x-3.5 relative overflow-hidden group">
            <span className="text-2xl p-2.5 bg-indigo-50 rounded-2xl">🤖</span>
            <div className="space-y-1">
              <h5 className="font-bold text-indigo-800 text-sm">{t('placeholders.aiLabel')}</h5>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{t('placeholders.aiDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Request to Join Tuition Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[999] p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-outfit font-black text-slate-800 text-lg flex items-center gap-1.5">
                <span>🎒</span>
                <span>{i18n.language === 'hi' ? 'ट्यूशन में शामिल होने का अनुरोध' : 'Request to Join Tuition'}</span>
              </h3>
              <button 
                onClick={() => { setShowJoinModal(false); setJoinErrorMsg(''); setJoinSuccessMsg(''); }}
                className="p-2 hover:bg-slate-200 text-slate-500 rounded-full transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="p-6 space-y-4 flex-1">
              {joinErrorMsg && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-2xl flex items-center space-x-1.5 text-xs font-semibold">
                  <AlertCircle size={15} />
                  <span>{joinErrorMsg}</span>
                </div>
              )}

              {joinSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3.5 rounded-2xl flex items-center space-x-1.5 text-xs font-semibold">
                  <span>✅ {joinSuccessMsg}</span>
                </div>
              )}

              {/* Subject Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400">
                  {i18n.language === 'hi' ? 'इच्छित विषय चुनें *' : 'Select Subject Interested In *'}
                </label>
                <select
                  value={requestSubject}
                  onChange={(e) => setRequestSubject(e.target.value)}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none"
                >
                  <option value="">-- Choose Subject --</option>
                  {teacher.subjects.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Parent Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400">
                  {i18n.language === 'hi' ? 'अभिभावक का फोन नंबर (वैकल्पिक)' : 'Parent Contact Phone (Optional)'}
                </label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none"
                />
              </div>

              {/* Cover Letter message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400">
                  {i18n.language === 'hi' ? 'शिक्षिका के लिए संदेश (वैकल्पिक)' : 'Message to Teacher (Optional)'}
                </label>
                <textarea
                  rows="3"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Tell the teacher about your academic goals, timing preferences, or study needs..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white outline-none focus:border-brand-500 transition-all resize-none"
                ></textarea>
              </div>

              {/* Actions submit */}
              <button
                type="submit"
                disabled={sendingRequest}
                className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-75"
              >
                {sendingRequest ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                <span>{sendingRequest ? 'Sending Request...' : 'Submit Enrollment Request'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TeacherProfile;
