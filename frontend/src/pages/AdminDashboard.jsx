import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Star, Map, Trash2, ShieldAlert, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import StarRating from '../components/StarRating';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Tabs
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'reviews'

  // Data states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const { data } = await axios.get('/api/admin/stats');
        setStats(data);
      } else if (activeTab === 'users') {
        const { data } = await axios.get('/api/admin/users');
        setUsersList(data || []);
      } else if (activeTab === 'reviews') {
        const { data } = await axios.get('/api/admin/reviews');
        setReviewsList(data || []);
      }
    } catch (err) {
      console.error('Admin API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this user account and all their records?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      triggerAlert('User purged successfully.');
      fetchAdminData();
    } catch (err) {
      triggerAlert('Failed to delete user.');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Moderate and delete this review?')) return;
    try {
      await axios.delete(`/api/admin/reviews/${id}`);
      triggerAlert('Review moderated and deleted.');
      fetchAdminData();
    } catch (err) {
      triggerAlert('Failed to moderate review.');
    }
  };

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 4500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Alert popup */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-lg border bg-slate-900 text-white border-slate-800 flex items-center space-x-2 text-sm font-semibold animate-slide-up">
          <ShieldAlert size={18} className="text-[#f97316]" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden mb-8 shadow-premium">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="bg-orange-500/20 border border-orange-500/30 text-orange-300 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
            {t('dashboard.admin.adminBadge')}
          </span>
          <h1 className="font-outfit font-black text-3xl flex items-center gap-2">
            <span>🛡️</span>
            <span>{t('dashboard.admin.title')}</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-medium">
            System administration control console. Purge spam users, moderate reviews, and map rural hotspots demands.
          </p>
        </div>
      </div>

      {/* Grid: Navigation & Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Tabs Column (Col 3) */}
        <div className="lg:col-span-3 space-y-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center space-x-3 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
            }`}
          >
            <TrendingUp size={18} />
            <span>{t('dashboard.sidebar.stats')}</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center space-x-3 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
            }`}
          >
            <Users size={18} />
            <span>{t('dashboard.admin.usersTab')}</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full text-left p-4 rounded-2xl font-bold text-sm transition-all flex items-center space-x-3 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-brand-500 text-white shadow'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-100'
            }`}
          >
            <Star size={18} />
            <span>{t('dashboard.admin.reviewsTab')}</span>
          </button>
        </div>

        {/* Right Tab Content Panels (Col 9) */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: Analytical stats */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="shimmer h-24 rounded-2xl"></div>
                  <div className="shimmer h-24 rounded-2xl"></div>
                  <div className="shimmer h-24 rounded-2xl"></div>
                </div>
              ) : (
                <>
                  {/* Dashboard Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">{t('dashboard.admin.statsTotalUsers')}</p>
                      <p className="font-outfit font-black text-3xl text-brand-600 mt-2">{stats?.totalUsers || 0}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">({stats?.totalStudents || 0} students)</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">{t('dashboard.admin.statsTotalTutors')}</p>
                      <p className="font-outfit font-black text-3xl text-[#f97316] mt-2">{stats?.totalTeachers || 0}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">({stats?.activeTeachers || 0} active now)</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-400">{t('dashboard.admin.statsWaitlistCount')}</p>
                      <p className="font-outfit font-black text-3xl text-red-600 mt-2">{stats?.uniqueAreaHotspots || 0}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">({stats?.totalAreaRequestsCount || 0} waitlist demands)</p>
                    </div>
                  </div>

                  {/* Hotspots waitlist locations */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-outfit font-extrabold text-xl text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle size={20} className="text-red-500 animate-pulse" />
                      <span>{t('dashboard.admin.hotspotsHeading')}</span>
                    </h3>
                    
                    {stats?.areaRequestsHotlist?.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl">
                        No waitlist areas registered yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stats?.areaRequestsHotlist?.map((hotspot) => (
                          <div key={hotspot._id} className="flex justify-between items-center p-4 bg-red-50/30 border border-red-100/50 rounded-2xl">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">📍</span>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{hotspot.address}</p>
                                <p className="text-[10px] text-slate-500 font-semibold">Logged: {new Date(hotspot.timestamp).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <span className="bg-red-100 text-red-700 font-extrabold text-xs px-3 py-1 rounded-xl">
                              {hotspot.requestCount} requests
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: User purging moderation */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-outfit font-extrabold text-xl text-slate-900">{t('dashboard.admin.usersTab')}</h3>

              {loading ? (
                <div className="shimmer h-40 rounded-2xl"></div>
              ) : usersList.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl">
                  No registered users in the system database.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4 text-right">Moderation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {usersList.map((usr) => (
                        <tr key={usr._id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-extrabold text-slate-900">{usr.name}</td>
                          <td className="p-4 text-slate-500">{usr.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full border text-[8px] uppercase tracking-wider font-extrabold ${
                              usr.role === 'teacher'
                                ? 'bg-orange-50 border-orange-100 text-orange-700'
                                : 'bg-brand-50 border-brand-100 text-brand-700'
                            }`}>
                              {usr.role}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-600">{usr.phone}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => deleteUser(usr._id)}
                              className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors cursor-pointer"
                              title={t('dashboard.admin.deleteUserConfirm')}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Reviews moderation */}
          {activeTab === 'reviews' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-outfit font-extrabold text-xl text-slate-900">{t('dashboard.admin.reviewsTab')}</h3>

              {loading ? (
                <div className="shimmer h-40 rounded-2xl"></div>
              ) : reviewsList.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl">
                  No student reviews to moderate yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewsList.map((rev) => (
                    <div key={rev._id} className="flex justify-between items-start gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-xs">{rev.studentName}</span>
                          <span className="text-[10px] text-slate-400 font-bold">reviewed</span>
                          <span className="font-extrabold text-slate-950 text-xs">
                            {rev.teacher?.user?.name || 'Purged Educator'}
                          </span>
                        </div>
                        <StarRating rating={rev.rating} size={11} />
                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                      </div>
                      
                      <button
                        onClick={() => deleteReview(rev._id)}
                        className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-100 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                        title={t('dashboard.admin.deleteReviewConfirm')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
