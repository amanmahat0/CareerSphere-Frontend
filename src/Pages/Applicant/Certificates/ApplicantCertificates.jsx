import React, { useState, useEffect } from 'react';
import {
  Award, Download, Eye, FileText, ImageIcon, Loader2, AlertCircle, X,
} from 'lucide-react';
import ApplicantSidebar from '../Components/ApplicantSidebar';
import DashboardHeader from '../../../Components/DashboardHeader';
import { api } from '../../../utils/api';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `${BACKEND_URL}${url}`;
  return url;
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

export default function ApplicantCertificates() {
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [preview, setPreview]           = useState(null); // { url, type, name }

  useEffect(() => {
    api.getMyCertificates()
      .then(res => setCertificates(res.data || []))
      .catch(err => setError(err.message || 'Failed to load certificates'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (cert) => {
    const url = resolveUrl(cert.fileUrl);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = cert.fileName || cert.title;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  };

  const isPdf = (cert) => cert.fileType === 'application/pdf';

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <ApplicantSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
        activePage="certificates"
      />
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

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Award size={20} className="text-blue-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">My Certificates</h1>
                <p className="text-sm text-slate-500">Certificates issued to you by employers and admin</p>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            ) : certificates.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
                <Award size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No certificates yet</p>
                <p className="text-slate-400 text-sm mt-1">Certificates issued to you will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map(cert => (
                  <div key={cert._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

                    {/* Preview thumbnail */}
                    <div
                      className="h-36 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors group relative"
                      onClick={() => setPreview({ url: resolveUrl(cert.fileUrl), type: cert.fileType, name: cert.fileName || cert.title })}
                    >
                      {isPdf(cert) ? (
                        <FileText size={40} className="text-blue-300 group-hover:text-blue-400 transition-colors" />
                      ) : (
                        <img
                          src={resolveUrl(cert.fileUrl)}
                          alt={cert.title}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      )}
                      {!isPdf(cert) && (
                        <div className="hidden w-full h-full items-center justify-center">
                          <ImageIcon size={40} className="text-blue-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye size={20} className="text-white drop-shadow" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1">{cert.title}</h3>
                      {cert.description && (
                        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{cert.description}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-auto">
                        Issued by <span className="font-medium text-slate-600">
                          {cert.issuedBy?.companyName || cert.issuedBy?.fullname || 'CareerSphere'}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(cert.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="px-4 pb-4 flex gap-2">
                      <button
                        onClick={() => setPreview({ url: resolveUrl(cert.fileUrl), type: cert.fileType, name: cert.fileName || cert.title })}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        onClick={() => handleDownload(cert)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Download size={13} /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <p className="font-semibold text-slate-800 text-sm truncate">{preview.name}</p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownload({ fileUrl: preview.url.replace(BACKEND_URL, ''), fileType: preview.type, fileName: preview.name, title: preview.name })}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Download size={13} /> Download
                </button>
                <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-auto" style={{ maxHeight: 'calc(90vh - 56px)' }}>
              {preview.type === 'application/pdf' ? (
                <iframe src={preview.url} title="Certificate" className="w-full" style={{ height: '80vh' }} />
              ) : (
                <img src={preview.url} alt="Certificate" className="w-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
