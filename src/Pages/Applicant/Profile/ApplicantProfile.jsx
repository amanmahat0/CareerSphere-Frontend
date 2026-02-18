import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit,
  X,
  Check,
  Briefcase,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import Sidebar from '../Components/Applicant Sidebar';
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

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ApplicantProfile = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Fetch fresh user data from backend if userId exists
          if ((parsedUser.id || parsedUser._id) && token) {
            try {
              const response = await api.request('/applicant/profile', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              const userData = {
                ...parsedUser,
                ...response.data,
                applicantType: response.data?.applicantType || parsedUser.applicantType || 'Student'
              };
              
              setUser({
                name: userData.name || userData.fullname || 'User',
                role: 'Applicant',
                avatar: (userData.name || userData.fullname || 'U').charAt(0).toUpperCase(),
                notificationCount: 2
              });
              setProfileData(userData);
              setEditFormData(userData);
            } catch (error) {
              console.log('Backend profile fetch failed, using localStorage:', error.message);
              // Fallback to localStorage data
              setUser({
                name: parsedUser.name || parsedUser.fullname || 'User',
                role: 'Applicant',
                avatar: (parsedUser.name || parsedUser.fullname || 'U').charAt(0).toUpperCase(),
                notificationCount: 2
              });
              setProfileData(parsedUser);
              setEditFormData(parsedUser);
            }
          } else {
            setUser({
              name: parsedUser.name || parsedUser.fullname || 'User',
              role: 'Applicant',
              avatar: (parsedUser.name || parsedUser.fullname || 'U').charAt(0).toUpperCase(),
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
      const token = localStorage.getItem('token');
      // Call API to update profile
      const response = await api.request('/applicant/profile/update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: editFormData
      });
      
      // Update localStorage with server response data
      const updatedData = response.data || editFormData;
      localStorage.setItem('user', JSON.stringify(updatedData));
      
      // Update state
      setProfileData(updatedData);
      setUser(prev => ({
        ...prev,
        name: updatedData.name || updatedData.fullname || 'User',
        avatar: (updatedData.name || updatedData.fullname || 'U').charAt(0).toUpperCase()
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

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    setUploadingPicture(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${API_BASE_URL}/applicant/profile/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload profile picture');
      }

      // Update state with new profile picture
      const newProfilePicture = data.data.profilePicture;
      setProfileData(prev => ({ ...prev, profilePicture: newProfilePicture }));
      setEditFormData(prev => ({ ...prev, profilePicture: newProfilePicture }));
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, profilePicture: newProfilePicture }));

      setMessage({ type: 'success', text: 'Profile picture uploaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload profile picture' });
    } finally {
      setUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!profileData?.profilePicture) return;
    
    setUploadingPicture(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applicant/profile/picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete profile picture');
      }

      // Update state to remove profile picture
      setProfileData(prev => ({ ...prev, profilePicture: null }));
      setEditFormData(prev => ({ ...prev, profilePicture: null }));
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, profilePicture: null }));

      setMessage({ type: 'success', text: 'Profile picture deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to delete profile picture' });
    } finally {
      setUploadingPicture(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (!profileData?.profilePicture) return null;
    // If it's a relative URL, prepend the base URL
    if (profileData.profilePicture.startsWith('/uploads')) {
      return `${API_BASE_URL.replace('/api', '')}${profileData.profilePicture}`;
    }
    return profileData.profilePicture;
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
                    <div className="relative group">
                      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
                        {getProfilePictureUrl() ? (
                          <img 
                            src={getProfilePictureUrl()} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center text-white text-3xl font-bold">
                            {user?.avatar}
                          </div>
                        )}
                      </div>
                      {/* Profile Picture Upload Overlay */}
                      <div 
                        onClick={handleProfilePictureClick}
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {uploadingPicture ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <Camera className="text-white" size={24} />
                        )}
                      </div>
                      {/* Delete button */}
                      {profileData?.profilePicture && (
                        <button
                          onClick={handleDeleteProfilePicture}
                          disabled={uploadingPicture}
                          className="absolute -bottom-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition disabled:opacity-50"
                          title="Delete profile picture"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                      />
                    </div>
                    <div className="pt-2">
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.name || 'User'}</h2>
                      <p className="text-sm text-slate-500">Click on avatar to upload a new picture</p>
                    </div>
                  </div>

                  {/* Personal Information Section */}
                  <div className="mb-8">
                    <h3 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Personal Information</h3>
                    {isEditing ? (
                      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        <InputField
                          label="Full Name"
                          name="name"
                          type="text"
                          value={editFormData.name || editFormData.fullname || ''}
                          onChange={handleInputChange}
                          icon={<User className="text-slate-500" size={16} />}
                        />
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
                        <div className="mb-2">
                          <label className="block text-xs font-medium text-slate-700 mb-2">Applicant Type</label>
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:bg-blue-50 transition">
                            <Briefcase className="text-indigo-500" size={16} />
                            <select
                              name="applicantType"
                              value={editFormData.applicantType || 'Student'}
                              onChange={handleInputChange}
                              className="flex-1 bg-transparent outline-none text-slate-900 text-sm"
                            >
                              <option value="Student">Student</option>
                              <option value="Fresh Graduate">Fresh Graduate</option>
                              <option value="Experienced">Experienced</option>
                              <option value="Career Changer">Career Changer</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        <InfoItem 
                          icon={<User className="text-slate-500" size={16} />} 
                          label="Full Name" 
                          value={profileData?.name || profileData?.fullname || 'Not provided'} 
                        />
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