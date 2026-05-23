import React, { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../../../../utils/api';
import { toast } from '../../../../utils/toast';

export default function HiringConfirmationPopup({ candidate, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    candidate.startDate ? new Date(candidate.startDate).toISOString().split('T')[0] : ''
  );
  const [hiringSummary, setHiringSummary] = useState(candidate.hiringSummary || '');

  const handleConfirmHiring = async () => {
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.confirmHire(candidate._id, {
        startDate,
        hiringSummary,
      });

      if (response.success) {
        toast.success('Candidate successfully hired! Welcome to the team.');
        onUpdate(response.data);
        onClose();
      }
    } catch (err) {
      console.error('Error confirming hiring:', err);
      toast.error(err.message || 'Failed to confirm hiring');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-3 flex justify-between items-start sticky top-0 bg-white border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Confirm Hiring</h2>
            <p className="text-sm text-slate-500 mt-0.5">Complete hiring for {candidate.userId?.fullname}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Candidate info */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-1.5 text-sm">
            <div><span className="font-semibold text-slate-700">Name: </span><span className="text-slate-600">{candidate.userId?.fullname}</span></div>
            <div><span className="font-semibold text-slate-700">Position: </span><span className="text-slate-600">{candidate.jobId?.title}</span></div>
            {candidate.salary && (
              <div><span className="font-semibold text-slate-700">Agreed Salary: </span><span className="text-slate-600">{candidate.salary} {candidate.currency}</span></div>
            )}
          </div>

          {/* Start Date (required) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Hiring summary / welcome note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Welcome Note (optional)</label>
            <textarea
              value={hiringSummary}
              onChange={(e) => setHiringSummary(e.target.value)}
              placeholder="e.g. We're excited to have you join us! Please report to HR on your first day."
              rows={3}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmHiring}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Hire
          </button>
        </div>
      </div>
    </div>
  );
}
