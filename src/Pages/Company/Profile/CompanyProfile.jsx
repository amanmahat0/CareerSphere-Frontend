import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit,
  X,
  Check,
  Camera,
  Trash2,
  Lock,
  Globe,
  Users,
  Facebook,
  Instagram,
  Linkedin,
  FileText
} from 'lucide-react';
import CompanySidebar from '../Components/CompanySidebar';
import CompanyChangePassword from '../ForgotPassword/CompanyChangePassword';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';

// Helper Component: InputField for editable profile fields
const InputField = ({ label, name, type, value, onChange, icon, placeholder }) => (
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
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      />
    </div>
  </div>
);

// Helper Component: TextareaField for multi-line text
const TextareaField = ({ label, name, value, onChange, icon, placeholder, rows = 4 }) => (
  <div className="mb-2">
    <label className="block text-xs font-medium text-slate-700 mb-2">{label}</label>
    <div className="flex items-start gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:bg-blue-50 transition">
      <span className="mt-1">{icon}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="flex-1 bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm resize-none"
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
      />
    </div>
  </div>
);

// Helper Component: SelectField for dropdown
const SelectField = ({ label, name, value, onChange, icon, options }) => (
  <div className="mb-2">
    <label className="block text-xs font-medium text-slate-700 mb-2">{label}</label>
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus-within:border-blue-500 focus-within:bg-blue-50 transition">
      {icon}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent outline-none text-slate-900 text-sm cursor-pointer"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);

// Helper Component: InfoItem for display-only profile fields
const InfoItem = ({ icon, label, value }) => {
  const displayValue = typeof value === 'string' && (!value || value.toLowerCase() === 'not provided') 
    ? <span className="text-slate-400 italic">Not provided</span>
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

const CompanyProfile = () => {
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

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' },
  ];

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Fetch fresh user data from backend
          if ((parsedUser.id || parsedUser._id) && token) {
            try {
              const response = await api.request('/company/profile', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              const userData = {
                ...parsedUser,
                ...response.data,
              };
              
              setUser({
                name: userData.companyName || userData.fullname || 'Company',
                role: 'Company',
                avatar: (userData.companyName || userData.fullname || 'C').charAt(0).toUpperCase(),
                notificationCount: 2
              });
              setProfileData(userData);
              setEditFormData({
                ...userData,
                socialMedia: userData.socialMedia || { facebook: '', instagram: '', linkedin: '' }
              });
            } catch (error) {
              console.log('Backend profile fetch failed, using localStorage:', error.message);
              // Fallback to localStorage data
              setUser({
                name: parsedUser.companyName || parsedUser.fullname || 'Company',
                role: 'Company',
                avatar: (parsedUser.companyName || parsedUser.fullname || 'C').charAt(0).toUpperCase(),
                notificationCount: 2
              });
              setProfileData(parsedUser);
              setEditFormData({
                ...parsedUser,
                socialMedia: parsedUser.socialMedia || { facebook: '', instagram: '', linkedin: '' }
              });
            }
          } else {
            setUser({
              name: parsedUser.companyName || parsedUser.fullname || 'Company',
              role: 'Company',
              avatar: (parsedUser.companyName || parsedUser.fullname || 'C').charAt(0).toUpperCase(),
              notificationCount: 2
            });
            setProfileData(parsedUser);
            setEditFormData({
              ...parsedUser,
              socialMedia: parsedUser.socialMedia || { facebook: '', instagram: '', linkedin: '' }
            });
          }
        } catch (error) {
          console.error('Error parsing user:', error);
        }
      }
    };
    
    fetchCompanyProfile();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFormData({
      ...profileData,
      socialMedia: profileData?.socialMedia || { facebook: '', instagram: '', linkedin: '' }
    });
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested socialMedia fields
    if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Call API to update profile
      const response = await api.request('/company/profile/update', {
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
        name: updatedData.companyName || updatedData.fullname || 'Company',
        avatar: (updatedData.companyName || updatedData.fullname || 'C').charAt(0).toUpperCase()
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

      const response = await fetch(`${API_BASE_URL}/company/profile/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload company logo');
      }

      // Update state with new profile picture
      const newProfilePicture = data.data.profilePicture;
      setProfileData(prev => ({ ...prev, profilePicture: newProfilePicture }));
      setEditFormData(prev => ({ ...prev, profilePicture: newProfilePicture }));
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, profilePicture: newProfilePicture }));

      setMessage({ type: 'success', text: 'Company logo uploaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error uploading company logo:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload company logo' });
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
      const response = await fetch(`${API_BASE_URL}/company/profile/picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete company logo');
      }

      // Update state to remove profile picture
      setProfileData(prev => ({ ...prev, profilePicture: null }));
      setEditFormData(prev => ({ ...prev, profilePicture: null }));
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, profilePicture: null }));

      setMessage({ type: 'success', text: 'Company logo deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error deleting company logo:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to delete company logo' });
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

  const getCompanySizeLabel = (value) => {
    const option = companySizeOptions.find(opt => opt.value === value);
    return option ? option.label : value || 'Not provided';
  };

  if (!user) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Dashboard Header Component */}
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(true)} 
        userRole="Company"
        dashboardPath="/company/dashboard"
        profilePath="/company/profile"
      />

      {/* Main Content Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Component */}
        <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="profile" />

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
              <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
              <p className="text-slate-500 text-xs mt-1">Manage your company information and settings</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-8 border-b border-slate-200 mb-6 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`pb-2 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Building2 size={14} /> Company Information
              </button>
              <button 
                onClick={() => setActiveTab('password')}
                className={`pb-2 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'password' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Lock size={14} /> Change Password
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

            {/* Profile Card or Change Password Section */}
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
                  
                  {/* Header: Logo & Basic Info */}
                  <div className="flex items-start gap-5 mb-8">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-blue-50 rounded-xl flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
                        {getProfilePictureUrl() ? (
                          <img 
                            src={getProfilePictureUrl()} 
                            alt="Company Logo" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-900 flex items-center justify-center text-white text-3xl font-bold">
                            {user?.avatar}
                          </div>
                        )}
                      </div>
                      {/* Logo Upload Overlay */}
                      <div 
                        onClick={handleProfilePictureClick}
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                          title="Delete company logo"
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
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">
                        {profileData?.companyName || user?.name || 'Company Name'}
                      </h2>
                      <p className="text-sm text-slate-500">Click on logo to upload a new one</p>
                    </div>
                  </div>

                  {/* Company Information Section */}
                  <div className="mb-8">
                    <h3 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Company Information</h3>
                    {isEditing ? (
                      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        <InputField
                          label="Company Name"
                          name="companyName"
                          type="text"
                          value={editFormData.companyName || ''}
                          onChange={handleInputChange}
                          icon={<Building2 className="text-slate-500" size={16} />}
                        />
                        <SelectField
                          label="Company Size"
                          name="companySize"
                          value={editFormData.companySize || ''}
                          onChange={handleInputChange}
                          icon={<Users className="text-slate-500" size={16} />}
                          options={companySizeOptions}
                        />
                        <InputField
                          label="Location"
                          name="address"
                          type="text"
                          value={editFormData.address || ''}
                          onChange={handleInputChange}
                          icon={<MapPin className="text-purple-500" size={16} />}
                        />
                        <InputField
                          label="Website"
                          name="website"
                          type="url"
                          value={editFormData.website || ''}
                          onChange={handleInputChange}
                          icon={<Globe className="text-blue-500" size={16} />}
                          placeholder="https://example.com"
                        />
                        <div className="md:col-span-2">
                          <TextareaField
                            label="About Company"
                            name="aboutCompany"
                            value={editFormData.aboutCompany || ''}
                            onChange={handleInputChange}
                            icon={<FileText className="text-slate-500" size={16} />}
                            placeholder="Describe your company, mission, values, and culture..."
                            rows={4}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        <InfoItem 
                          icon={<Building2 className="text-slate-500" size={16} />} 
                          label="Company Name" 
                          value={profileData?.companyName || 'Not provided'} 
                        />
                        <InfoItem 
                          icon={<Users className="text-slate-500" size={16} />} 
                          label="Company Size" 
                          value={getCompanySizeLabel(profileData?.companySize)} 
                        />
                        <InfoItem 
                          icon={<MapPin className="text-purple-500" size={16} />} 
                          label="Location" 
                          value={profileData?.address || 'Not provided'} 
                        />
                        <InfoItem 
                          icon={<Globe className="text-blue-500" size={16} />} 
                          label="Website" 
                          value={profileData?.website ? (
                            <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {profileData.website}
                            </a>
                          ) : 'Not provided'} 
                        />
                        <div className="md:col-span-2">
                          <InfoItem 
                            icon={<FileText className="text-slate-500" size={16} />} 
                            label="About Company" 
                            value={profileData?.aboutCompany || 'Not provided'} 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contact Information Section */}
                  <div className="mb-8">
                    <h3 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Contact Information</h3>
                    {isEditing ? (
                      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        <InputField
                          label="Contact Person"
                          name="fullname"
                          type="text"
                          value={editFormData.fullname || ''}
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
                          value={editFormData.phone || editFormData.phonenumber || ''}
                          onChange={handleInputChange}
                          icon={<Phone className="text-green-500" size={16} />}
                        />
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        <InfoItem 
                          icon={<User className="text-slate-500" size={16} />} 
                          label="Contact Person" 
                          value={profileData?.fullname || 'Not provided'} 
                        />
                        <InfoItem 
                          icon={<Mail className="text-blue-500" size={16} />} 
                          label="Email Address" 
                          value={profileData?.email || 'Not provided'} 
                        />
                        <InfoItem 
                          icon={<Phone className="text-green-500" size={16} />} 
                          label="Phone Number" 
                          value={profileData?.phone || profileData?.phonenumber || 'Not provided'} 
                        />
                      </div>
                    )}
                  </div>

                  {/* Social Media Section */}
                  <div>
                    <h3 className="text-base font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Social Media</h3>
                    {isEditing ? (
                      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        <InputField
                          label="Facebook"
                          name="socialMedia.facebook"
                          type="url"
                          value={editFormData.socialMedia?.facebook || ''}
                          onChange={handleInputChange}
                          icon={<Facebook className="text-blue-600" size={16} />}
                          placeholder="https://facebook.com/yourcompany"
                        />
                        <InputField
                          label="Instagram"
                          name="socialMedia.instagram"
                          type="url"
                          value={editFormData.socialMedia?.instagram || ''}
                          onChange={handleInputChange}
                          icon={<Instagram className="text-pink-500" size={16} />}
                          placeholder="https://instagram.com/yourcompany"
                        />
                        <InputField
                          label="LinkedIn"
                          name="socialMedia.linkedin"
                          type="url"
                          value={editFormData.socialMedia?.linkedin || ''}
                          onChange={handleInputChange}
                          icon={<Linkedin className="text-blue-700" size={16} />}
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                        <InfoItem 
                          icon={<Facebook className="text-blue-600" size={16} />} 
                          label="Facebook" 
                          value={profileData?.socialMedia?.facebook ? (
                            <a href={profileData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {profileData.socialMedia.facebook}
                            </a>
                          ) : 'Not provided'} 
                        />
                        <InfoItem 
                          icon={<Instagram className="text-pink-500" size={16} />} 
                          label="Instagram" 
                          value={profileData?.socialMedia?.instagram ? (
                            <a href={profileData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
                              {profileData.socialMedia.instagram}
                            </a>
                          ) : 'Not provided'} 
                        />
                        <InfoItem 
                          icon={<Linkedin className="text-blue-700" size={16} />} 
                          label="LinkedIn" 
                          value={profileData?.socialMedia?.linkedin ? (
                            <a href={profileData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                              {profileData.socialMedia.linkedin}
                            </a>
                          ) : 'Not provided'} 
                        />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              <CompanyChangePassword profileData={profileData} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyProfile;
