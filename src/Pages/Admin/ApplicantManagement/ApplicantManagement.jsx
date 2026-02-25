import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, X,
  Download, Plus, Edit2, Trash2, Loader2
} from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';

const ApplicantManagement = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch applicants from database
  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getAllApplicants();
      if (response.success) {
        setApplicants(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch applicants');
      console.error('Error fetching applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApplicant = async () => {
    if (!formData.name || !formData.email || !formData.phone) return;
    if (!editingId && !formData.password) return; // Password required for new applicants

    try {
      setSubmitting(true);
      setError(null);

      if (editingId) {
        // Update existing applicant
        const updateData = {
          fullname: formData.name,
          email: formData.email,
          phonenumber: formData.phone,
        };
        // Only include password if it's provided
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        const response = await api.updateApplicant(editingId, updateData);
        if (response.success) {
          await fetchApplicants(); // Refresh the list
        }
        setEditingId(null);
      } else {
        // Create new applicant
        const response = await api.createApplicant({
          fullname: formData.name,
          email: formData.email,
          phonenumber: formData.phone,
          password: formData.password,
        });
        if (response.success) {
          await fetchApplicants(); // Refresh the list
        }
      }
      setFormData({ name: '', email: '', phone: '', password: '' });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message || 'Failed to save applicant');
      console.error('Error saving applicant:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteApplicant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this applicant?')) return;

    try {
      setError(null);
      const response = await api.deleteApplicant(id);
      if (response.success) {
        await fetchApplicants(); // Refresh the list
      }
    } catch (err) {
      setError(err.message || 'Failed to delete applicant');
      console.error('Error deleting applicant:', err);
    }
  };

  const handleEditApplicant = (id) => {
    const applicant = applicants.find((app) => app.id === id);
    if (!applicant) return;
    setFormData({
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      password: '', // Password field empty for editing
    });
    setEditingId(id);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', password: '' });
    setError(null);
  };

  // Filter applicants based on search
  const filteredApplicants = applicants.filter((app) => {
    const term = searchTerm.toLowerCase();
    return (
      app.name?.toLowerCase().includes(term) ||
      app.email?.toLowerCase().includes(term) ||
      app.phone?.toLowerCase().includes(term) ||
      app.applicantType?.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: applicants.length,
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Dashboard Header Component */}
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        userRole="Admin"
        dashboardPath="/admin/dashboard"
        profilePath="/admin/profile"
      />

      {/* Main Content Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Component */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="applicants" />

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">

          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col lg:flex-row justify-between lg:items-start mb-6 gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Applicant Management</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Manage applicant profiles and placement status</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    <Download size={16} /> Export Data
                  </button>
                  <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-shadow shadow-md">
                    <Plus size={16} /> Add Applicant
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 gap-4 lg:gap-6 mb-8">
                <MetricCard label="Total Applicants" value={loading ? '...' : stats.total} />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Table Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table Filters */}
                <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="relative flex-1 w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search by name, email, or phone..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Actual Table */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                  ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                        <th className="px-4 lg:px-6 py-4">Name</th>
                        <th className="px-4 py-4">Email</th>
                        <th className="px-4 py-4 hidden md:table-cell">Phone</th>
                        <th className="px-4 py-4 hidden lg:table-cell">Type</th>
                        <th className="px-4 lg:px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredApplicants.length > 0 ? (
                        filteredApplicants.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                            <td className="px-4 lg:px-6 py-4">
                              <div className="flex items-center gap-3">
                                {app.profilePicture ? (
                                  <img src={app.profilePicture} alt={app.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <Users size={16} className="text-slate-400" />
                                  </div>
                                )}
                                <p className="font-semibold text-slate-700">{app.name}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-600 text-xs">{app.email}</td>
                            <td className="px-4 py-4 text-slate-600 hidden md:table-cell text-xs">{app.phone}</td>
                            <td className="px-4 py-4 hidden lg:table-cell">
                              <span className="px-2 lg:px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">
                                {app.applicantType || 'Student'}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleEditApplicant(app.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200">
                                  <Edit2 size={12} /> Edit
                                </button>
                                <button onClick={() => handleDeleteApplicant(app.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200">
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                            <p className="font-medium">No applicants found matching your filters</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Applicant' : 'Add Applicant'}</h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded" disabled={submitting}>
                <X size={18} />
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Password {editingId ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  placeholder={editingId ? 'Enter new password (optional)' : 'Enter password (min 6 characters)'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={handleCloseModal} 
                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded hover:bg-slate-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddApplicant} 
                className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting}
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {editingId ? 'Update Applicant' : 'Save Applicant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const MetricCard = ({ label, value, color = "text-slate-800" }) => (
  <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 lg:mb-4">{label}</p>
    <p className={`text-2xl lg:text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default ApplicantManagement;
