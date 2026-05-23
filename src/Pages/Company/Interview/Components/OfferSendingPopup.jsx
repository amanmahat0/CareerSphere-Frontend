import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { api } from '../../../../utils/api';
import { toast } from '../../../../utils/toast';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'NPR', 'AUD', 'CAD', 'SGD'];

export default function OfferSendingPopup({ candidate, onClose, onUpdate, onOfferSent }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    salary: candidate.salary || '',
    currency: candidate.currency || 'USD',
    joiningDate: candidate.joiningDate ? new Date(candidate.joiningDate).toISOString().split('T')[0] : '',
    benefits: candidate.benefits || '',
    contractFile: candidate.contractFile || '',
    offerExpiryDate: candidate.offerExpiryDate ? new Date(candidate.offerExpiryDate).toISOString().split('T')[0] : '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendOffer = async () => {
    if (!formData.salary || !String(formData.salary).trim()) {
      toast.error('Please enter the offered salary');
      return;
    }
    if (!formData.joiningDate) {
      toast.error('Please select a joining date');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.sendOffer(candidate._id, {
        salary: formData.salary,
        currency: formData.currency,
        joiningDate: formData.joiningDate,
        benefits: formData.benefits,
        contractFile: formData.contractFile,
        offerExpiryDate: formData.offerExpiryDate || null,
      });

      if (response.success) {
        toast.success('Offer sent successfully! The applicant will be notified.');
        if (onOfferSent) {
          onOfferSent(response.data);
        } else {
          onUpdate(response.data);
          onClose();
        }
      }
    } catch (err) {
      console.error('Error sending offer:', err);
      toast.error(err.message || 'Failed to send offer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-3 flex justify-between items-start sticky top-0 bg-white border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Send Job Offer</h2>
            <p className="text-sm text-slate-500 mt-0.5">Send offer to {candidate.userId?.fullname}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* Salary + Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Salary <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
                placeholder="e.g. 50000"
                min="0"
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Joining Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => handleChange('joiningDate', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Benefits</label>
            <input
              type="text"
              value={formData.benefits}
              onChange={(e) => handleChange('benefits', e.target.value)}
              placeholder="e.g. Health insurance, PF, Bonus (comma-separated)"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Offer Expiry */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Offer Expiry Date</label>
            <input
              type="date"
              value={formData.offerExpiryDate}
              onChange={(e) => handleChange('offerExpiryDate', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Contract File */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contract File URL</label>
            <input
              type="text"
              value={formData.contractFile}
              onChange={(e) => handleChange('contractFile', e.target.value)}
              placeholder="Paste contract PDF URL (optional)"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
            onClick={handleSendOffer}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send Offer
          </button>
        </div>
      </div>
    </div>
  );
}
