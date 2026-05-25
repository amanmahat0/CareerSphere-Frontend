import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Building2, MapPin, Briefcase, Calendar, Trash2, ArrowRight } from 'lucide-react';
import Sidebar from '../Components/ApplicantSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const resolveLogoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `${BACKEND_URL}${url}`;
  return url;
};

const SavedJobs = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('savedJobs');
    if (stored) {
      try { setSavedJobs(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleUnsave = (jobId) => {
    const updated = savedJobs.filter((j) => j.id !== jobId);
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpen={() => setSidebarOpen(true)} activePage="saved" />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(prev => !prev)}
          userRole="Applicant"
          dashboardPath="/applicant/dashboard"
          profilePath="/applicant/profile"
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
              <p className="text-slate-500 text-xs mt-1">Jobs and internships you've bookmarked for later.</p>
            </div>

            {savedJobs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
                <Bookmark size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-semibold text-sm">No saved jobs yet</p>
                <p className="text-slate-400 text-xs mt-1 mb-5">
                  Browse opportunities and click the Bookmark icon to save them here.
                </p>
                <button
                  onClick={() => navigate('/opportunities')}
                  className="bg-blue-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-950 transition"
                >
                  Browse Opportunities
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex items-center gap-4"
                  >
                    {/* Logo */}
                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                      {resolveLogoUrl(job.logo) ? (
                        <img src={resolveLogoUrl(job.logo)} alt={job.company} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={20} className="text-slate-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{job.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{job.company}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-400">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {job.location}
                          </span>
                        )}
                        {job.type && (
                          <span className="flex items-center gap-1">
                            <Briefcase size={11} /> {job.type}
                          </span>
                        )}
                        {job.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> Deadline: {job.deadline}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/opportunities/${job.id}`)}
                        className="text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                      >
                        View <ArrowRight size={11} />
                      </button>
                      <button
                        onClick={() => handleUnsave(job.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Remove from saved"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default SavedJobs;
