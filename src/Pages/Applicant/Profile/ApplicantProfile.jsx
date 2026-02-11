import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Edit,
  X,
  Check,
  Briefcase
} from 'lucide-react';
import Sidebar from '../Components/Sidebar';
import CertificatesSection from './ApplicantCertificates';
import Header from '../../../Components/Header';
import { api } from '../../../utils/api';

// Helper Component: InputField for editable profile fields
const InputField = ({ label, name, type, value, onChange, icon }) => (
  <div className="mb-2">
    <label className="block text-xs font-medium text-slate-700 mb-2">{label}</label>
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:bg-blue-50 transition">
      {icon}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </div>
  </div>
);

// Helper Component: InfoItem for display-only profile fields
const InfoItem = ({ icon, label, value }) => {
  const displayValue = typeof value === 'string' && value.toLowerCase() === 'not provided' 
    ? <span className="text-slate-400 italic">{value}</span>
    : <span className="font-medium text-slate-700">{value}</span>;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
        {icon}
        <span>{label}</span>
      </div>
      {displayValue}
    </div>
  );
};

const ApplicantProfile = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Fetch fresh user data from backend if userId exists
          if (parsedUser.id || parsedUser._id) {
            try {
              const response = await api.request('/applicant/profile', {
                method: 'GET',
              });
              
              const userData = {
                ...parsedUser,
                ...response.data,
                applicantType: response.data?.applicantType || parsedUser.applicantType || 'Student'
              };
              
              setUser({
                name: userData.name || 'User',
                role: 'Applicant',
                avatar: userData.name ? userData.name.charAt(0).toUpperCase() : 'U',
                notificationCount: 2
              });
              setProfileData(userData);
              setEditFormData(userData);
            } catch (error) {
              console.log('Backend profile fetch failed, using localStorage:', error.message);
              // Fallback to localStorage data
              setUser({
                name: parsedUser.name || 'User',
                role: 'Applicant',
                avatar: parsedUser.name ? parsedUser.name.charAt(0).toUpperCase() : 'U',
                notificationCount: 2
              });
              setProfileData(parsedUser);
              setEditFormData(parsedUser);
            }
          } else {
            setUser({
              name: parsedUser.name || 'User',
              role: 'Applicant',
              avatar: parsedUser.name ? parsedUser.name.charAt(0).toUpperCase() : 'U',
              notificationCount: 2
            });
            setProfileData(parsedUser);
            setEditFormData(parsedUser);
          }
        } catch (error) {
          console.error('Error parsing user:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFormData(profileData);
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Call API to update profile
      const response = await api.request('/applicant/profile/update', {
        method: 'POST',
        body: editFormData
      });
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(editFormData));
      
      // Update state
      setProfileData(editFormData);
      setUser(prev => ({
        ...prev,
        name: editFormData.name || 'User'
      }));
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header Component */}
      <Header isDashboard={false} />

      {/* Main Content Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Component */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="profile" />

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Profile Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
              <p className="text-slate-500 text-xs mt-1">Manage your personal information and certificates</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-8 border-b border-slate-200 mb-6">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`pb-2 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <User size={14} /> Profile Information
              </button>
              <button 
                onClick={() => setActiveTab('certificates')}
                className={`pb-2 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'certificates' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <FileText size={14} /> Certificates (4)
              </button>
            </div>

            {/* Success/Error Messages */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.type === 'success' ? <Check size={20} /> : <X size={20} />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            {/* Profile Card or Certificates Section */}
            {activeTab === 'profile' ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 relative">
                
                {/* Edit Button and Save/Cancel Buttons */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check size={14} /> {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex items-center gap-1 bg-slate-300 hover:bg-slate-400 text-slate-700 px-3 py-1.5 rounded text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleEditClick}
                      className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-950 transition shadow-md"
                    >
                      <Edit size={14} /> Edit Profile
                    </button>
                  )}
                </div>

                <div className="p-6">
                  
                  {/* Header: Avatar & Basic Info */}
                  <div className="flex items-start gap-5 mb-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden shrink-0">
                      <div className="w-full h-full bg-linear-to-br from-blue-500 to-blue-900 flex items-center justify-center text-white text-2xl font-bold">
                        {user?.avatar}
                      </div>
                    </div>
                    <div className="pt-2">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">{user?.name || 'User'}</h2>
                    </div>
                  </div>

                  {/* Personal Information Section */}
                  <div className="mb-8">
                    <h3 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
                    {isEditing ? (
                      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        <InputField
                          label="Email Address"
                          name="email"
                          type="email"
                          value={editFormData.email || ''}
                          onChange={handleInputChange}
                          icon={<Mail className="text-blue-500" size={16} />}
                        />
                        <InputField
                          label="Phone Number"
                          name="phone"
                          type="tel"
                          value={editFormData.phone || ''}
                          onChange={handleInputChange}
                          icon={<Phone className="text-green-500" size={16} />}
                        />
                        <InputField
                          label="Address"
                          name="address"
                          type="text"
                          value={editFormData.address || ''}
                          onChange={handleInputChange}
                          icon={<MapPin className="text-purple-500" size={16} />}
                        />
                        <InputField
                          label="Date of Birth"
                          name="dob"
                          type="date"
                          value={editFormData.dob || ''}
                          onChange={handleInputChange}
                          icon={<Calendar className="text-orange-500" size={16} />}
                        />
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        <InfoItem 
                          icon={<Mail className="text-blue-500" size={16} />} 
                          label="Email Address" 
                          value={profileData?.email || 'Not provided'} 
                        />
                        <InfoItem 
                          icon={<Phone className="text-green-500" size={16} />} 
                          label="Phone Number" 
                          value={profileData?.phone || 'Not provided'} 
                        />
                        <InfoItem 
                          icon={<MapPin className="text-purple-500" size={16} />} 
                          label="Address" 
                          value={profileData?.address || 'Not provided'} 
                        />
                        <InfoItem 
                          icon={<Calendar className="text-orange-500" size={16} />} 
                          label="Date of Birth" 
                          value={profileData?.dob || 'Not provided'} 
                        />
                        <InfoItem 
                          icon={<Briefcase className="text-indigo-500" size={16} />} 
                          label="Applicant Type" 
                          value={profileData?.applicantType || 'Not provided'} 
                        />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              <CertificatesSection />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplicantProfile;