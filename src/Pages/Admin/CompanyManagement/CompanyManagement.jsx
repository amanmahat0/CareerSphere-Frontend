import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Search, X,
  Plus, Edit2, Trash2, CheckCircle, XCircle, Eye, Loader2
} from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import CompanyDetailsModal from '../Components/CompanyDetailsModal';
import { api } from '../../../utils/api';

const CompanyManagement = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetch companies from API
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getAllCompanies();
      setCompanies(response.data || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const handleAddCompany = async () => {
    if (!formData.name || !formData.email || !formData.phone) return;
    if (!editingId && !formData.password) return; // Password required for new companies

    try {
      setSubmitting(true);
      setError(null);

      if (editingId) {
        // Update existing company
        const updateData = {
          companyName: formData.name,
          email: formData.email,
          phonenumber: formData.phone,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        const response = await api.updateCompany(editingId, updateData);
        if (response.success) {
          await fetchCompanies();
        }
        setEditingId(null);
      } else {
        // Create new company
        const response = await api.createCompany({
          companyName: formData.name,
          email: formData.email,
          phonenumber: formData.phone,
          password: formData.password,
        });
        if (response.success) {
          await fetchCompanies();
        }
      }
      setFormData({ name: '', email: '', phone: '', password: '' });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message || 'Failed to save company');
      console.error('Error saving company:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCompany = (id) => {
    const company = companies.find((c) => c.id === id);
    if (!company) return;
    setFormData({
      name: company.companyName,
      email: company.email,
      phone: company.phonenumber || company.phone,
      password: '',
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

  const handleVerifySuccess = (companyId) => {
    // Update the company in the list
    setCompanies(prev => 
      prev.map(c => 
        c.id === companyId 
          ? { ...c, isVerified: true, verificationStatus: 'approved' }
          : c
      )
    );
    setShowDetailsModal(false);
  };

  const handleRejectSuccess = (companyId) => {
    // Update the company in the list
    setCompanies(prev => 
      prev.map(c => 
        c.id === companyId 
          ? { ...c, isVerified: false, verificationStatus: 'rejected' }
          : c
      )
    );
    setShowDetailsModal(false);
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await api.deleteCompanyAdmin(companyId);
        setCompanies(prev => prev.filter(c => c.id !== companyId));
      } catch (err) {
        alert('Error deleting company: ' + err.message);
      }
    }
  };

  // Filter companies based on search
  const filteredCompanies = companies.filter((company) => {
    const term = searchTerm.toLowerCase();
    return (
      company.companyName?.toLowerCase().includes(term) ||
      company.email?.toLowerCase().includes(term) ||
      company.industry?.toLowerCase().includes(term) ||
      company.address?.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: companies.length,
    verified: companies.filter(c => c.isVerified).length,
    pending: companies.filter(c => c.verificationStatus === 'pending').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
        <DashboardHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          userRole="Admin"
          dashboardPath="/admin/dashboard"
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Dashboard Header Component */}
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        userRole="Admin"
        dashboardPath="/admin/dashboard"
      />

      {/* Main Content Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Component */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="companies" />

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
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Company Management</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Manage registered companies and verify their documents</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-shadow shadow-md">
                    <Plus size={16} /> Add Company
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3">
                  <XCircle size={20} />
                  <div>
                    <p className="font-semibold">Error loading companies</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
                <MetricCard label="Total Companies" value={stats.total} />
                <MetricCard label="Verified" value={stats.verified} color="text-emerald-600" />
                <MetricCard label="Pending Review" value={stats.pending} color="text-amber-600" />
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table Filters */}
                <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="relative flex-1 w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search by name, email, industry, or location..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Actual Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                        <th className="px-4 py-4 w-12">S.N</th>
                        <th className="px-4 lg:px-6 py-4">Company</th>
                        <th className="px-4 py-4">Email</th>
                        <th className="px-4 py-4 hidden md:table-cell">Industry</th>
                        <th className="px-4 py-4 hidden lg:table-cell">Size</th>
                        <th className="px-4 py-4 text-center">Docs</th>
                        <th className="px-4 py-4 text-center">Status</th>
                        <th className="px-4 lg:px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company, index) => (
                          <tr key={company.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                            <td className="px-4 py-4 text-slate-600 text-xs font-medium">{index + 1}</td>
                            <td className="px-4 lg:px-6 py-4">
                              <p className="font-semibold text-slate-700">{company.companyName}</p>
                            </td>
                            <td className="px-4 py-4 text-slate-600 text-xs">{company.email}</td>
                            <td className="px-4 py-4 text-slate-600 hidden md:table-cell text-xs">{company.industry || '-'}</td>
                            <td className="px-4 py-4 text-slate-600 hidden lg:table-cell text-xs">{company.companySize || '-'}</td>
                            <td className="px-4 py-4">
                              <div className="flex justify-center">
                                <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                                  {company.documentsCount || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-center">
                                {company.isVerified ? (
                                  <span className="px-2 lg:px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100 uppercase flex items-center gap-1">
                                    <CheckCircle size={12} /> Verified
                                  </span>
                                ) : company.verificationStatus === 'rejected' ? (
                                  <span className="px-2 lg:px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-100 uppercase flex items-center gap-1">
                                    <XCircle size={12} /> Rejected
                                  </span>
                                ) : (
                                  <span className="px-2 lg:px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded border border-amber-100 uppercase flex items-center gap-1">
                                   Pending
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleViewDetails(company)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-blue-200 text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye size={12} /> View Details
                                </button>
                                <button 
                                  onClick={() => handleEditCompany(company.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200"
                                >
                                  <Edit2 size={12} /> Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteCompany(company.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                            <p className="font-medium">
                              {companies.length === 0 ? 'No companies found' : 'No companies matching your search'}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Company' : 'Add Company'}</h3>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Company Name *</label>
                <input
                  type="text"
                  placeholder="Enter company name"
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
                onClick={handleAddCompany} 
                className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting}
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {editingId ? 'Update Company' : 'Save Company'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Details Modal */}
      {showDetailsModal && selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCompany(null);
          }}
          onVerify={handleVerifySuccess}
          onReject={handleRejectSuccess}
        />
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

export default CompanyManagement;
