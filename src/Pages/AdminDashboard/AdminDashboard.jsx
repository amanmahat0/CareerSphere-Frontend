import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Users, BarChart3, Settings, Shield, AlertCircle } from "lucide-react";
import Header from "../../Components/Header";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in as admin
    const storedUser = localStorage.getItem("user");
    const isAdmin = localStorage.getItem("isAdmin");

    if (!storedUser || isAdmin !== "true") {
      navigate("/institution-login", { replace: true });
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("isAdmin");
    navigate("/institution-login", { replace: true });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f9ff]">
      <Header />

      {/* Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-sm p-8 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-blue-100 mt-1">Welcome, {user.fullname}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <Users className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          {/* Total Institutions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Institutions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <BarChart3 className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          {/* Total Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Jobs Posted</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <BarChart3 className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">System Status</p>
                <p className="text-sm font-bold text-green-600 mt-2">✓ Operational</p>
              </div>
              <AlertCircle className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* User Management */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Manage all users, applicants, and institutions in the system.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Manage Users
            </button>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Configure system-wide settings and preferences.
            </p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
              System Settings
            </button>
          </div>

          {/* Reports & Analytics */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View detailed analytics and generate system reports.
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              View Reports
            </button>
          </div>

          {/* Moderation */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Moderation</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Review and moderate content, applications, and user activities.
            </p>
            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors">
              Moderation Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
