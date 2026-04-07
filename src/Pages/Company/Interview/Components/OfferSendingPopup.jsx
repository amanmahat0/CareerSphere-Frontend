import React, { useState } from 'react';
import { X, Loader2, Upload } from 'lucide-react';
import { api } from '../../../../utils/api';

export default function OfferSendingPopup({ candidate, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    contractFile: candidate.contractFile || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendOffer = async () => {
    // Validation
    if (!formData.contractFile.trim()) {
      alert('Please provide contract file URL or path');
      return;
    }

    setIsLoading(true);
    try {
      const updatePayload = {
        interviewStep: 'offer',
        interviewStatus: 'offer_sent',
        contractFile: formData.contractFile,
      };

      const response = await api.updateInterviewStep(candidate._id, updatePayload);

      if (response.success) {
        alert('Offer sent successfully!');
        onUpdate(response.data);
        onClose();
      }
    } catch (err) {
      console.error('Error sending offer:', err);
      alert('Failed to send offer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-start sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Send Job Offer</h2>
            <p className="text-sm text-slate-500 mt-1">Send offer to {candidate.userId?.fullname}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Contract File */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contract File</label>
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={formData.contractFile}
                onChange={(e) => handleChange('contractFile', e.target.value)}
                placeholder="Paste contract file URL or path"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">PDF files recommended. Upload the employment contract file.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendOffer}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send Offer
          </button>
        </div>
      </div>
    </div>
  );
}
