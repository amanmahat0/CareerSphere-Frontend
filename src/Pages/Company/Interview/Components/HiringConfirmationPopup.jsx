import React, { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../../../../utils/api';

export default function HiringConfirmationPopup({ candidate, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmHiring = async () => {
    setIsLoading(true);
    try {
      const updatePayload = {
        interviewStep: 'hired',
        interviewStatus: 'completed',
        hiredDate: new Date().toISOString(),
      };

      const response = await api.updateInterviewStep(candidate._id, updatePayload);

      if (response.success) {
        alert('Candidate successfully hired!');
        onUpdate(response.data);
        onClose();
      }
    } catch (err) {
      console.error('Error confirming hiring:', err);
      alert('Failed to confirm hiring');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Confirm Hiring</h2>
            <p className="text-sm text-slate-500 mt-1">Complete hiring for {candidate.userId?.fullname}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-4">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              Mark this candidate as <span className="font-semibold">HIRED</span>?
            </p>
            <p className="text-xs text-blue-700 mt-2">
              This completes the hiring process for this position.
            </p>
          </div>

          {/* Hiring Details */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
            <div>
              <span className="font-semibold text-slate-700">Name:</span>
              <span className="text-slate-600 ml-2">{candidate.userId?.fullname}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Position:</span>
              <span className="text-slate-600 ml-2">{candidate.jobId?.title}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmHiring}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Hiring
          </button>
        </div>
      </div>
    </div>
  );
}
