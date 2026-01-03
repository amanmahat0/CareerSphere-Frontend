import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Briefcase, Heart, FileText, User, Award } from "lucide-react";
import Header from "../../Components/Header";

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    const userType = localStorage.getItem("userType");

    if (!storedUser || userType !== "applicant") {
      navigate("/login", { replace: true });
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    navigate("/login", { replace: true });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f9ff]">
      <Header />

      {/* Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.fullname}!
              </h1>
              <p className="text-gray-600 mt-2">Applicant Dashboard</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Applications Sent */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Applications Sent</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <FileText className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          {/* Shortlisted */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <Award className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          {/* Saved Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Saved Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <Heart className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>

          {/* Profile Strength */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Profile Strength</p>
                <p className="text-sm text-gray-500 mt-2">Complete your profile</p>
              </div>
              <User className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 border-2 border-blue-600 rounded-lg text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                <Briefcase className="w-5 h-5" />
                Browse Jobs
              </button>
              <button className="p-4 border-2 border-green-600 rounded-lg text-green-600 font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                <Award className="w-5 h-5" />
                View Internships
              </button>
              <button className="p-4 border-2 border-purple-600 rounded-lg text-purple-600 font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                <User className="w-5 h-5" />
                Update Profile
              </button>
              <button className="p-4 border-2 border-gray-600 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Manage Resume
              </button>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-900">{user.fullname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900 break-all">{user.email}</p>
              </div>
              {user.phonenumber && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{user.phonenumber}</p>
                </div>
              )}
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="text-center py-8">
            <p className="text-gray-600">No recent activity. Start by browsing jobs!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
