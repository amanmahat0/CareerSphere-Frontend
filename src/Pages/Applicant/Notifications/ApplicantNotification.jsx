import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { CheckCircle2, Calendar, Briefcase, Bell, X, Award } from 'lucide-react';
import { api } from '../../../utils/api.js';

const ApplicantNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    let userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    // If userId not found in localStorage, try to extract from user object
    if (!userId) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userId = userObj._id || userObj.id;
        } catch (e) {
          console.error('Failed to parse user object:', e);
        }
      }
    }

    if (!userId || !token) {
      // Silently return if user not authenticated (expected on public pages)
      return;
    }

    // Strip /api suffix — Socket.IO connects to the base server, not the API path
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

    // Connect to WebSocket server
    const socket = io(socketUrl, {
      auth: {
        token,
        userId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Handle connection
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-notifications', userId);
      fetchNotifications();
    });

    // Handle new notifications
    socket.on('new-notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle connection error
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.getNotifications();
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await api.markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notification._id ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application_shortlisted':
        return <CheckCircle2 size={18} className="text-green-600" />;
      case 'interview_scheduled':
      case 'interview_reminder':
        return <Calendar size={18} className="text-blue-600" />;
      case 'offer_received':
      case 'hired':
        return <Briefcase size={18} className="text-purple-600" />;
      case 'certificate_issued':
        return <Award size={18} className="text-amber-600" />;
      default:
        return <Bell size={18} className="text-slate-600" />;
    }
  };

  // Get icon background based on notification type
  const getIconBgColor = (type) => {
    switch (type) {
      case 'application_shortlisted':
        return 'bg-green-100';
      case 'interview_scheduled':
      case 'interview_reminder':
        return 'bg-blue-100';
      case 'offer_received':
      case 'hired':
        return 'bg-purple-100';
      case 'certificate_issued':
        return 'bg-amber-100';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        title={isConnected ? 'Notifications - Connected' : 'Notifications'}
      >
        <Bell size={20} />


        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="w-95 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden flex flex-col absolute right-0 mt-2 max-h-96">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800">Notifications</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-slate-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div>
                  <p className="text-slate-500 text-center">No notifications</p>
                  <p className="text-xs text-slate-400 text-center mt-2">Check back later for updates</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`relative flex items-start gap-3 p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 shrink-0 rounded-full ${getIconBgColor(
                        notification.type
                      )} flex items-center justify-center mt-0.5`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="pr-4 flex-1">
                      <h3 className="text-sm font-medium text-slate-900 mb-1">
                        {notification.type === 'admin_notification'
                          ? 'Message from Admin'
                          : notification.type === 'company_notification'
                          ? 'Message from Company'
                          : notification.type === 'certificate_issued'
                          ? 'Certificate Issued'
                          : notification.type
                              .split('_')
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {notification.message}
                      </p>
                      <span className="text-[11px] text-slate-500 mt-2 block">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    {/* Unread Dot */}
                    {!notification.read && (
                      <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-200 p-3 flex justify-between items-center">
              {unreadCount > 0 ? (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  Mark all as read
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicantNotification;