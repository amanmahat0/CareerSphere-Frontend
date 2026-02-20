import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Search, X,
  Download, Plus, Edit2, Trash2, CheckCircle, XCircle
} from 'lucide-react';
import AdminSidebar from '../Components/AdminSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';

const CompanyManagement = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ companyName: '', email: '', industry: '', phone: '', location: '' });
  const [companies, setCompanies] = useState([
    { id: 1, companyName: 'Tech Solutions Pvt. Ltd.', email: 'hr@techsolutions.com', industry: 'Information Technology', phone: '9851234567', location: 'Kathmandu', verified: true, jobsPosted: 12 },
    { id: 2, companyName: 'Green Energy Nepal', email: 'careers@greenenergy.com', industry: 'Renewable Energy', phone: '9852234567', location: 'Lalitpur', verified: true, jobsPosted: 5 },
    { id: 3, companyName: 'Himalayan Bank Ltd.', email: 'recruitment@himalayan.com', industry: 'Banking & Finance', phone: '9853234567', location: 'Kathmandu', verified: true, jobsPosted: 8 },
    { id: 4, companyName: 'Daraz Nepal', email: 'jobs@daraz.com.np', industry: 'E-commerce', phone: '9854234567', location: 'Kathmandu', verified: true, jobsPosted: 15 },
    { id: 5, companyName: 'CloudTech Innovations', email: 'hr@cloudtech.io', industry: 'Cloud Computing', phone: '9855234567', location: 'Bhaktapur', verified: false, jobsPosted: 3 },
    { id: 6, companyName: 'Nepal Telecom', email: 'careers@ntc.net.np', industry: 'Telecommunications', phone: '9856234567', location: 'Kathmandu', verified: true, jobsPosted: 10 },
  ]);

  const handleAddCompany = () => {
    if (!formData.companyName || !formData.email || !formData.industry || !formData.phone || !formData.location) return;
    
    if (editingId) {
      setCompanies((prev) => prev.map((company) => 
        company.id === editingId ? { ...company, ...formData } : company
      ));
      setEditingId(null);
    } else {
      const newCompany = {
        id: companies.length + 1,
        ...formData,
        verified: false,
        jobsPosted: 0,
      };
      setCompanies((prev) => [...prev, newCompany]);
    }
    setFormData({ companyName: '', email: '', industry: '', phone: '', location: '' });
    setShowAddModal(false);
  };

  const handleDeleteCompany = (id) => {
    setCompanies((prev) => prev.filter((company) => company.id !== id));
  };

  const handleEditCompany = (id) => {
    const company = companies.find((c) => c.id === id);
    if (!company) return;
    setFormData({
      companyName: company.companyName,
      email: company.email,
      industry: company.industry,
      phone: company.phone,
      location: company.location,
    });
    setEditingId(id);
    setShowAddModal(true);
  };

  const handleToggleVerification = (id) => {
    setCompanies((prev) => prev.map((company) => 
      company.id === id ? { ...company, verified: !company.verified } : company
    ));
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setFormData({ companyName: '', email: '', industry: '', phone: '', location: '' });
  };

  // Filter companies based on search
  const filteredCompanies = companies.filter((company) => {
    const term = searchTerm.toLowerCase();
    return (
      company.companyName.toLowerCase().includes(term) ||
      company.email.toLowerCase().includes(term) ||
      company.industry.toLowerCase().includes(term) ||
      company.location.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: companies.length,
    verified: companies.filter(c => c.verified).length,
    totalJobs: companies.reduce((sum, c) => sum + c.jobsPosted, 0),
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
                  <p className="text-slate-500 text-sm mt-0.5">Manage registered companies and their verification status</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    <Download size={16} /> Export Data
                  </button>
                  <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-shadow shadow-md">
                    <Plus size={16} /> Add Company
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
                <MetricCard label="Total Companies" value={stats.total} />
                <MetricCard label="Verified Companies" value={stats.verified} color="text-emerald-600" />
                <MetricCard label="Total Jobs Posted" value={stats.totalJobs} color="text-blue-600" />
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
                        <th className="px-4 lg:px-6 py-4">Company</th>
                        <th className="px-4 py-4">Email</th>
                        <th className="px-4 py-4 hidden md:table-cell">Industry</th>
                        <th className="px-4 py-4 hidden lg:table-cell">Location</th>
                        <th className="px-4 py-4 text-center">Jobs</th>
                        <th className="px-4 py-4 text-center">Status</th>
                        <th className="px-4 lg:px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company) => (
                          <tr key={company.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                            <td className="px-4 lg:px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                  <Building2 size={16} className="text-blue-600" />
                                </div>
                                <p className="font-semibold text-slate-700">{company.companyName}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-600 text-xs">{company.email}</td>
                            <td className="px-4 py-4 text-slate-600 hidden md:table-cell text-xs">{company.industry}</td>
                            <td className="px-4 py-4 text-slate-600 hidden lg:table-cell text-xs">{company.location}</td>
                            <td className="px-4 py-4 text-center">
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">{company.jobsPosted}</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-center">
                                {company.verified ? (
                                  <span className="px-2 lg:px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100 uppercase flex items-center gap-1">
                                    <CheckCircle size={12} /> Verified
                                  </span>
                                ) : (
                                  <span className="px-2 lg:px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded border border-orange-100 uppercase flex items-center gap-1">
                                    <XCircle size={12} /> Pending
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleToggleVerification(company.id)} 
                                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border ${
                                    company.verified 
                                      ? 'border-orange-200 text-orange-600 hover:bg-orange-50' 
                                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                >
                                  {company.verified ? <XCircle size={12} /> : <CheckCircle size={12} />}
                                  {company.verified ? 'Revoke' : 'Verify'}
                                </button>
                                <button onClick={() => handleEditCompany(company.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200">
                                  <Edit2 size={12} /> Edit
                                </button>
                                <button onClick={() => handleDeleteCompany(company.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200">
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                            <p className="font-medium">No companies found matching your filters</p>
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Edit Company' : 'Add Company'}</h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="text"
                placeholder="Industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium border border-slate-200 rounded hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleAddCompany} className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded hover:bg-blue-800">
                {editingId ? 'Update Company' : 'Save Company'}
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

export default CompanyManagement;
