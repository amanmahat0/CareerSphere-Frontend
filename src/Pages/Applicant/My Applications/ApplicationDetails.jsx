import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Calendar, Briefcase, AlertCircle } from 'lucide-react';
import { api } from '../../../utils/api';
import InterviewProgressTimeline from '../../../Components/applicant/InterviewProgressTimeline';

const ApplicationDetailsModal = ({ application, onClose, onUpdate }) => {
  const [appData, setAppData] = useState(application);
  const [loading, setLoading] = useState(false);

  // Fetch latest application data on mount
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!application?._id) return;
      setLoading(true);
      try {
        const response = await api.getApplicationById(application._id);
        if (response.success) {
          setAppData(response.data);
        }
      } catch (error) {
        console.error('Error fetching application details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [application?._id]);

  const handleTimelineUpdate = (updatedData) => {
    setAppData(updatedData);
    if (onUpdate) onUpdate(updatedData);
  };

  if (!appData) return null;

  const job = appData.jobId || {};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden max-h-[95vh] overflow-y-auto font-sans">
      {/* Header */}
      <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-200 bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{job.title || 'Job Title'}</h2>
              <p className="text-sm text-slate-600 mt-1">Interview Progress & Details</p>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

      {/* Body */}
      <div className="p-6 space-y-6">
            
            {/* Job Details Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center text-slate-600">
                <Building2 size={16} className="mr-2 text-slate-400" />
                <span className="text-sm"><span className="font-medium">Company:</span> {job.company || 'N/A'}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <MapPin size={16} className="mr-2 text-slate-400" />
                <span className="text-sm"><span className="font-medium">Location:</span> {job.location || 'N/A'}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <Calendar size={16} className="mr-2 text-slate-400" />
                <span className="text-sm"><span className="font-medium">Applied:</span> {formatDate(appData.appliedDate)}</span>
              </div>
              {job.salary && (
                <div className="flex items-center text-slate-600">
                  <Briefcase size={16} className="mr-2 text-slate-400" />
                  <span className="text-sm"><span className="font-medium">Salary:</span> {job.salary}</span>
                </div>
              )}
            </div>

            {/* Withdrawal Message */}
            {appData.status === 'withdrawn' && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-orange-900 font-semibold">Application Withdrawn</p>
                  <p className="text-orange-800 text-sm mt-1">
                    You have withdrawn this application.
                  </p>
                  {appData.withdrawnAt && (
                    <p className="text-orange-700 text-xs mt-2">
                      Withdrawn on {new Date(appData.withdrawnAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  {appData.withdrawalReason && (
                    <p className="text-orange-800 text-sm mt-2">
                      <span className="font-medium">Reason:</span> {appData.withdrawalReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Rejection Message */}
            {appData.status === 'rejected' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-900 font-semibold">Application Rejected</p>
                  <p className="text-red-800 text-sm mt-1">
                    Unfortunately, your application was not selected for this position.
                  </p>
                  {appData.rejectedAt && (
                    <p className="text-red-700 text-xs mt-2">
                      Rejected on {new Date(appData.rejectedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  {appData.rejectionFeedback && (
                    <p className="text-red-800 text-sm mt-2">
                      <span className="font-medium">Feedback:</span> {appData.rejectionFeedback}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Interview Timeline - Only show if not rejected or withdrawn */}
            {appData.status !== 'rejected' && appData.status !== 'withdrawn' && (
              <>
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-slate-600">
                    <div className="animate-spin rounded-full h-8 w-8 border border-slate-300 border-t-blue-600"></div>
                  </div>
                ) : (
                  <InterviewProgressTimeline 
                    application={appData}
                    onUpdate={handleTimelineUpdate}
                  />
                )}
              </>
            )}
          </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 p-6 pt-4 border-t border-slate-200 bg-white sticky bottom-0">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};


export default ApplicationDetailsModal;