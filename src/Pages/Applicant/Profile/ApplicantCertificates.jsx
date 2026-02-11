import React, { useState } from 'react';
import { Download, Trash2, Plus, FileText } from 'lucide-react';

const CertificatesSection = () => {
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      title: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2025-06-15',
      expiryDate: '2027-06-15',
      credentialId: 'AWS-12345',
      url: '#',
      status: 'Active'
    },
    {
      id: 2,
      title: 'Google Cloud Associate Cloud Engineer',
      issuer: 'Google Cloud',
      issueDate: '2025-05-20',
      expiryDate: '2027-05-20',
      credentialId: 'GCP-54321',
      url: '#',
      status: 'Active'
    },
    {
      id: 3,
      title: 'Scrum Master Certified',
      issuer: 'Scrum Alliance',
      issueDate: '2025-04-10',
      expiryDate: null,
      credentialId: 'SM-98765',
      url: '#',
      status: 'Active'
    },
    {
      id: 4,
      title: 'Microsoft Azure Fundamentals',
      issuer: 'Microsoft',
      issueDate: '2025-03-01',
      expiryDate: '2026-03-01',
      credentialId: 'Azure-44556',
      url: '#',
      status: 'Active'
    }
  ]);

  const handleDelete = (id) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header with Add Button */}
      <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Certificates</h2>
          <p className="text-slate-500 text-sm mt-1">Add and manage your professional certifications</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-950 transition shadow-md">
          <Plus size={16} /> Add Certificate
        </button>
      </div>

      {/* Certificates Grid */}
      <div className="p-8">
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div 
                key={cert.id}
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow relative group"
              >
                {/* Expired Badge */}
                {isExpired(cert.expiryDate) && (
                  <div className="absolute top-3 right-3 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    Expired
                  </div>
                )}

                {/* Active Badge */}
                {!isExpired(cert.expiryDate) && (
                  <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    Active
                  </div>
                )}

                {/* Certificate Icon/Color Block */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-900 rounded-lg mb-4 flex items-center justify-center text-white font-bold text-lg">
                  {cert.title.charAt(0).toUpperCase()}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{cert.title}</h3>

                {/* Issuer */}
                <p className="text-sm text-slate-600 mb-4">{cert.issuer}</p>

                {/* Details Grid */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issue Date</span>
                    <span className="text-slate-900 font-medium">{formatDate(cert.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expiry Date</span>
                    <span className={`font-medium ${isExpired(cert.expiryDate) ? 'text-red-600' : 'text-slate-900'}`}>
                      {formatDate(cert.expiryDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Credential ID</span>
                    <span className="text-slate-900 font-mono text-xs font-medium">{cert.credentialId}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 text-white py-2 rounded-lg text-sm font-medium transition"
                  >
                    <Download size={14} /> View
                  </a>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 px-3 rounded-lg text-sm font-medium transition"
                    title="Delete certificate"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <FileText size={48} className="mx-auto" />
            </div>
            <p className="text-slate-500 text-lg mb-4">No certificates added yet</p>
            <button className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-950 transition shadow-md mx-auto">
              <Plus size={16} /> Add your first certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesSection;