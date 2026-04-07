import React, { useState, useEffect } from 'react';
import {
  X, Building2, Download, FileText, CheckCircle, XCircle, AlertCircle, Loader2,
  MapPin, PhoneIcon, Mail, Globe, Eye
} from 'lucide-react';
import { api } from '../../../utils/api';

const CompanyDetailsModal = ({ company, onClose, onVerify, onReject }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'documents', 'action'
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [fullCompanyData, setFullCompanyData] = useState(company);
  const [loading, setLoading] = useState(false);

  // Fetch full company details with documents when modal opens
  useEffect(() => {
    const fetchFullDetails = async () => {
      if (!company?.id) return;
      setLoading(true);
      try {
        const response = await api.getCompanyDetailsAdmin(company.id);
        setFullCompanyData(response.data);
      } catch (error) {
        console.error('Error fetching full company details:', error);
        // Fallback to the company from props if fetch fails
        setFullCompanyData(company);
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, [company?.id]);

  const handleVerify = async () => {
    if (!fullCompanyData || !fullCompanyData.id) return;
    
    setIsVerifying(true);
    try {
      // Get the current admin ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const adminId = user.id;

      await api.verifyCompany(fullCompanyData.id, adminId, adminNotes);
      onVerify?.(fullCompanyData.id);
      onClose();
    } catch (error) {
      console.error('Error verifying company:', error);
      alert('Failed to verify company: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!fullCompanyData || !fullCompanyData.id || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setIsRejecting(true);
    try {
      await api.rejectCompany(fullCompanyData.id, rejectionReason, adminNotes);
      onReject?.(fullCompanyData.id);
      onClose();
    } catch (error) {
      console.error('Error rejecting company:', error);
      alert('Failed to reject company: ' + error.message);
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadge = () => {
    const status = fullCompanyData?.verificationStatus || 'pending';
    const isVerified = fullCompanyData?.isVerified;

    if (status === 'approved' && isVerified) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 font-semibold text-sm rounded-full border border-green-300">
          <CheckCircle size={14} /> Verified
        </span>
      );
    } else if (status === 'rejected') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 font-semibold text-sm rounded-full border border-red-300">
          <XCircle size={14} /> Rejected
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 font-semibold text-sm rounded-full border border-yellow-300">
          <AlertCircle size={14} /> Pending
        </span>
      );
    }
  };

  const downloadDocument = (doc) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000${doc.filePath}`;
    link.target = '_blank';
    link.download = doc.originalName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewDocument = (doc) => {
    setSelectedDocument(doc);
    setViewerOpen(true);
  };

  const getDocumentPreviewUrl = (doc) => {
    return `http://localhost:5000${doc.filePath}`;
  };

  const isImageFile = (doc) => {
    return doc.filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  const isPdfFile = (doc) => {
    return doc.filePath.match(/\.pdf$/i);
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">{fullCompanyData?.companyName}</h2>
            <p className="text-sm text-slate-600">{fullCompanyData?.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>{getStatusBadge()}</div>
          <div className="text-sm text-slate-600">
            Documents: <span className="font-semibold">{fullCompanyData?.documents?.length || 0}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Company Info
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Documents
            {fullCompanyData?.documents?.length > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {fullCompanyData.documents.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'action'
                ? 'text-blue-600 border-blue-600'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            Actions
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Company Info Tab */}
          {activeTab === 'info' && (
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Building2 size={18} className="text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-600">Company Name</p>
                      <p className="font-medium text-slate-900">{fullCompanyData?.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium text-slate-900">{fullCompanyData?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <PhoneIcon size={18} className="text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="font-medium text-slate-900">{fullCompanyData?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-600">Address</p>
                      <p className="font-medium text-slate-900">{fullCompanyData?.address || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe size={18} className="text-blue-600 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-600">Website</p>
                      <p className="font-medium text-slate-900">{fullCompanyData?.website || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Company Size</p>
                    <p className="font-medium text-slate-900">{fullCompanyData?.companySize || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-800 mb-3">Contact Person</h4>
                <p className="text-sm text-slate-700">{fullCompanyData?.contactPerson}</p>
              </div>

              {/* About Company */}
              {fullCompanyData?.industry && (
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-3">About Company</h4>
                  <p className="text-sm text-slate-700">{fullCompanyData.industry}</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="p-6">
              {fullCompanyData?.documents && fullCompanyData.documents.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Uploaded Documents</h3>
                  {fullCompanyData.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{doc.originalName}</p>
                          <p className="text-xs text-slate-500">
                            Type: {doc.documentType?.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          {doc.uploadedAt && (
                            <p className="text-xs text-slate-500">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        <button
                          onClick={() => viewDocument(doc)}
                          className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          onClick={() => downloadDocument(doc)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Download size={16} /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600 font-medium">No documents uploaded yet</p>
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'action' && (
            <div className="p-6">
              {fullCompanyData?.verificationStatus === 'approved' ? (
                <div className="text-center py-8 bg-green-50 rounded-lg border-2 border-green-200">
                  <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
                  <p className="text-green-900 font-semibold">This company is already verified</p>
                  <p className="text-green-700 text-sm mt-1">
                    {fullCompanyData?.verifiedAt && `Verified on ${new Date(fullCompanyData.verifiedAt).toLocaleDateString()}`}
                  </p>
                </div>
              ) : fullCompanyData?.verificationStatus === 'rejected' ? (
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                    <p className="text-red-900 font-semibold flex items-center gap-2">
                      <XCircle size={18} /> Rejection Reason
                    </p>
                    <p className="text-red-700 text-sm mt-2">{fullCompanyData?.rejectionReason}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <h4 className="font-semibold text-slate-900">Resubmit for Verification</h4>
                    <p className="text-sm text-slate-600">
                      The company can upload new documents to resubmit for verification.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-blue-900 font-semibold text-sm">
                      Review Status: {fullCompanyData?.documents?.length === 0 ? 'No documents uploaded' : 'Documents ready for review'}
                    </p>
                  </div>

                  {/* Verify Section */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" /> Verify Company
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Admin Notes (Optional)
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add any additional notes about the verification..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          rows="3"
                        />
                      </div>
                      <button
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} /> Verify Company
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Reject Section */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <XCircle size={18} className="text-red-600" /> Reject Company
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Rejection Reason *
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Explain why the company is being rejected..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                          rows="3"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Admin Notes (Optional)
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add any additional notes..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                          rows="2"
                        />
                      </div>
                      <button
                        onClick={handleReject}
                        disabled={isRejecting || !rejectionReason.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isRejecting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle size={16} /> Reject Company
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewerOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-20 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Viewer Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedDocument.originalName}</h3>
                <p className="text-sm text-slate-500">
                  Type: {selectedDocument.documentType?.replace(/_/g, ' ').toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setViewerOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 p-4">
              {isImageFile(selectedDocument) ? (
                <div className="max-w-full max-h-full">
                  <img
                    src={getDocumentPreviewUrl(selectedDocument)}
                    alt={selectedDocument.originalName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : isPdfFile(selectedDocument) ? (
                <iframe
                  src={getDocumentPreviewUrl(selectedDocument)}
                  className="w-full h-full border-0"
                  title={selectedDocument.originalName}
                />
              ) : (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 font-medium">Document preview not available</p>
                  <p className="text-slate-500 text-sm mt-2">This file type cannot be previewed online</p>
                  <button
                    onClick={() => downloadDocument(selectedDocument)}
                    className="mt-4 flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Download size={16} /> Download to View
                  </button>
                </div>
              )}
            </div>

            {/* Viewer Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-white">
              <p className="text-xs text-slate-500">
                Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadDocument(selectedDocument)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  <Download size={16} /> Download
                </button>
                <button
                  onClick={() => setViewerOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors font-medium text-sm"
                >
                  <X size={16} /> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetailsModal;
