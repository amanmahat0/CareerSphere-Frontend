import React, { useState } from 'react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../../../utils/api';

export default function OfferResponsePopup({ candidate, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(candidate.offerResponse || 'accepted');
  const [notes, setNotes] = useState(candidate.offerResponseNotes || '');

  const handleCompleteOffer = async () => {
    setIsLoading(true);
    try {
      // If accepted, move to hired; if rejected, end
      const nextStep = response === 'accepted' ? 'hired' : 'rejected';
      const nextStatus = response === 'accepted' ? 'in progress' : 'completed';

      const updatePayload = {
        interviewStep: nextStep,
        interviewStatus: nextStatus,
        offerResponse: response,
        offerResponseNotes: notes,
      };

      const response_data = await api.updateInterviewStep(candidate._id, updatePayload);

      if (response_data.success) {
        const message = response === 'accepted'
          ? 'Offer accepted! Moving to hiring confirmation.'
          : 'Offer rejected by candidate.';
        alert(message);
        onUpdate(response_data.data);
        onClose();
      }
    } catch (err) {
      console.error('Error recording offer response:', err);
      alert('Failed to record offer response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Offer Response</h2>
            <p className="text-sm text-slate-500 mt-1">Record response from {candidate.userId?.fullname}</p>
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
          {/* Offer Response */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-3">Response</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setResponse('accepted')}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  response === 'accepted'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <CheckCircle className={response === 'accepted' ? 'text-blue-600' : 'text-slate-400'} size={20} />
                <span className={response === 'accepted' ? 'text-blue-700 font-semibold' : 'text-slate-600'}>Accepted</span>
              </button>

              <button
                onClick={() => setResponse('rejected')}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  response === 'rejected'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <XCircle className={response === 'rejected' ? 'text-red-600' : 'text-slate-400'} size={20} />
                <span className={response === 'rejected' ? 'text-red-700 font-semibold' : 'text-slate-600'}>Rejected</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or reasons..."
              rows={4}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
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
            onClick={handleCompleteOffer}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Record Response
          </button>
        </div>
      </div>
    </div>
  );
}
