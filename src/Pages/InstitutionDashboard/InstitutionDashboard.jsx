import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Building2, Users, FileText, Settings } from "lucide-react";
import Header from "../../Components/Header";

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    const userType = localStorage.getItem("userType");

    if (!storedUser || userType !== "institution") {
      navigate("/institution-login", { replace: true });
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
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
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.fullname}!
              </h1>
              <p className="text-gray-600 mt-2">Institution Dashboard</p>
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
          {/* Total Jobs Posted */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Jobs Posted</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <FileText className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </div>

          {/* Total Applications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <Users className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </div>

          {/* Internships Offered */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Internships Offered</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <Building2 className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Account Settings</p>
                <p className="text-sm text-gray-500 mt-2">Manage your profile</p>
              </div>
              <Settings className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border-2 border-blue-600 rounded-lg text-blue-600 font-medium hover:bg-blue-50 transition-colors">
              Post a New Job
            </button>
            <button className="p-4 border-2 border-green-600 rounded-lg text-green-600 font-medium hover:bg-green-50 transition-colors">
              Post an Internship
            </button>
            <button className="p-4 border-2 border-purple-600 rounded-lg text-purple-600 font-medium hover:bg-purple-50 transition-colors">
              View Applications
            </button>
            <button className="p-4 border-2 border-gray-600 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
