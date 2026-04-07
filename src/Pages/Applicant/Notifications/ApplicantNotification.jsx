import React, { useEffect, useState } from 'react';
import {
  Bell, CheckCircle, Clock, XCircle, AlertCircle, Building2, Briefcase,
  Calendar, TrendingUp, MessageSquare, Loader2
} from 'lucide-react';
import Sidebar from '../Components/Applicant Sidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';

const statusStyles = {
  pending: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-900',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
  },
  shortlisted: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-700',
    icon: TrendingUp,
  },
  accepted: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    badge: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  rejected: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    badge: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
};

const getStatusMessage = (status, interviewStep) => {
  const messages = {
    pending: 'Your application is under review',
    shortlisted: `Great! You\'ve been shortlisted - Currently at ${interviewStep || 'screening'} stage`,
    accepted: 'Congratulations! Your application has been accepted',
    rejected: 'Your application was not selected at this time',
  };
  return messages[status] || 'Application status unknown';
};

const ApplicantNotification = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'shortlisted', 'accepted', 'rejected'

  // Fetch applications to display as notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getUserApplications();
        if (response.success) {
          // Transform applications into notifications with timestamps
          const notifData = (response.data || []).map((app) => ({
            id: app._id,
            jobTitle: app.jobId?.title,
            company: app.jobId?.company,
            status: app.status,
            interviewStep: app.interviewStep,
            interviewStatus: app.interviewStatus,
            appliedDate: app.appliedDate,
            updatedDate: app.updatedDate,
            location: app.jobId?.location,
            jobType: app.jobId?.type,
            interviewNotes: app.interviewNotes,
          }));
          setNotifications(notifData);
        } else {
          setError('Failed to load notifications');
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'all') return true;
    return notif.status === activeTab;
  });

  const getStatusIcon = (status) => {
    const Icon = statusStyles[status]?.icon || AlertCircle;
    const colorClass = status === 'pending' ? 'text-yellow-600' :
                       status === 'shortlisted' ? 'text-blue-600' :
                       status === 'accepted' ? 'text-green-600' :
                       status === 'rejected' ? 'text-red-600' : 'text-gray-600';
    return <Icon size={20} className={colorClass} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNotificationStats = () => {
    return {
      total: notifications.length,
      pending: notifications.filter((n) => n.status === 'pending').length,
      shortlisted: notifications.filter((n) => n.status === 'shortlisted').length,
      accepted: notifications.filter((n) => n.status === 'accepted').length,
      rejected: notifications.filter((n) => n.status === 'rejected').length,
    };
  };

  const stats = getNotificationStats();

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        userRole="Applicant"
        dashboardPath="/applicant/dashboard"
        profilePath="/applicant/profile"
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="notifications" />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-slate-400">
                <p className="text-slate-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
                <p className="text-slate-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-400">
                <p className="text-slate-600 text-sm font-medium">Shortlisted</p>
                <p className="text-2xl font-bold text-blue-700">{stats.shortlisted}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
                <p className="text-slate-600 text-sm font-medium">Accepted</p>
                <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-400">
                <p className="text-slate-600 text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="flex overflow-x-auto border-b border-slate-200">
                {['all', 'pending', 'shortlisted', 'accepted', 'rejected'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Loading notifications...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3 mb-8">
                <AlertCircle size={24} className="text-red-600 shrink-0" />
                <div>
                  <p className="text-red-900 font-semibold">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredNotifications.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Bell size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 font-medium mb-2">No notifications yet</p>
                <p className="text-slate-500 text-sm">Your application updates will appear here</p>
              </div>
            )}

            {/* Notifications List */}
            {!loading && !error && filteredNotifications.length > 0 && (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const styles = statusStyles[notification.status];
                  const StatusIcon = styles.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`rounded-lg shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${styles.bg} ${styles.border}`}
                    >
                      {/* Header with Status */}
                      <div className="p-6 bg-linear-to-r from-white to-slate-50 border-b border-inherit">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {/* Company and Job Title */}
                            <div className="flex items-center gap-3 mb-2">
                              <Building2 size={18} className={styles.text} />
                              <h3 className={`text-lg font-bold ${styles.text}`}>
                                {notification.company || 'Unknown Company'}
                              </h3>
                            </div>

                            {/* Job Title */}
                            <div className="flex items-center gap-3 mb-3">
                              <Briefcase size={16} className="text-slate-500" />
                              <p className="text-slate-700 font-semibold">
                                {notification.jobTitle || 'Unknown Position'}
                              </p>
                            </div>

                            {/* Status Badge and Message */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${styles.badge}`}>
                                <StatusIcon size={14} />
                                {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                              </span>
                              <p className={`text-sm ${styles.text}`}>
                                {getStatusMessage(notification.status, notification.interviewStep)}
                              </p>
                            </div>
                          </div>

                          {/* Status Icon */}
                          <div className="shrink-0">
                            {getStatusIcon(notification.status)}
                          </div>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Location and Type */}
                          <div>
                            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Location</p>
                            <p className="text-slate-900">{notification.location || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Job Type</p>
                            <p className="text-slate-900">{notification.jobType || 'Not specified'}</p>
                          </div>

                          {/* Applied Date */}
                          <div>
                            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Applied On</p>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-500" />
                              <p className="text-slate-900">{formatDate(notification.appliedDate)}</p>
                            </div>
                          </div>

                          {/* Last Updated */}
                          <div>
                            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Last Updated</p>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-500" />
                              <p className="text-slate-900">{formatDate(notification.updatedDate)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Interview Status and Stage */}
                        {notification.status === 'shortlisted' && (
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Interview Stage</p>
                                <p className="text-slate-900 font-medium">
                                  {notification.interviewStep?.charAt(0).toUpperCase() + notification.interviewStep?.slice(1) || 'Screening'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Interview Status</p>
                                <p className={`font-medium ${
                                  notification.interviewStatus === 'completed' ? 'text-green-700' :
                                  notification.interviewStatus === 'in progress' ? 'text-blue-700' :
                                  notification.interviewStatus === 'pending' ? 'text-yellow-700' :
                                  'text-slate-700'
                                }`}>
                                  {notification.interviewStatus?.charAt(0).toUpperCase() + notification.interviewStatus?.slice(1) || 'Pending'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Interview Notes */}
                        {notification.interviewNotes && (
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="flex items-start gap-3">
                              <MessageSquare size={16} className="text-slate-500 mt-1 shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Company Notes</p>
                                <p className="text-slate-700 leading-relaxed">{notification.interviewNotes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status-specific Messages */}
                        {notification.status === 'rejected' && (
                          <div className="bg-red-100 rounded-lg p-4 border border-red-300">
                            <p className="text-red-900 text-sm">
                              <span className="font-semibold">Feedback:</span> Don't be discouraged! This is a great opportunity to grow. Keep applying and improving your skills.
                            </p>
                          </div>
                        )}

                        {notification.status === 'accepted' && (
                          <div className="bg-green-100 rounded-lg p-4 border border-green-300">
                            <p className="text-green-900 text-sm">
                              <span className="font-semibold">Congratulations!</span> You've been selected! The company will contact you soon with next steps.
                            </p>
                          </div>
                        )}

                        {notification.status === 'pending' && (
                          <div className="bg-yellow-100 rounded-lg p-4 border border-yellow-300">
                            <p className="text-yellow-900 text-sm">
                              <span className="font-semibold">Status:</span> Your application is being reviewed by the company. We'll notify you as soon as there's an update.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicantNotification;
