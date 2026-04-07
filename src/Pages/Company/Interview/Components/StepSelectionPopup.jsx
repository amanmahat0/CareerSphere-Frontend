import React from 'react';
import { X, Zap } from 'lucide-react';

const STEPS = [
  { value: 'test', label: 'Test (Optional)' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
];

export default function StepSelectionPopup({ candidate, onClose, onSelectStep }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-2 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Select Next Step</h2>
            <p className="text-sm text-slate-500 mt-1">Choose next stage for {candidate.userId?.fullname}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {STEPS.map((step) => (
            <button
              key={step.value}
              onClick={() => onSelectStep(step.value)}
              className="w-full p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div>
                <div className="font-semibold text-slate-900">{step.label}</div>
                <div className="text-xs text-slate-600 mt-1">
                  {step.value === 'test' && 'Configure test assignment'}
                  {step.value === 'interview' && 'Schedule interview'}
                  {step.value === 'offer' && 'Send job offer'}
                  {step.value === 'hired' && 'Mark as hired'}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
