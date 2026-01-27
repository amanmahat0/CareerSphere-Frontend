import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Briefcase, Heart, FileText, User, Award } from "lucide-react";
import Header from "../../../Components/Header";

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
              <User className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Browse Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Browse Jobs</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Explore job opportunities</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View Jobs
            </button>
          </div>

          {/* My Applications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Track your applications</p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              View All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;