import React, { useState } from 'react';
import { ChevronDown, Check, Zap, Loader2 } from 'lucide-react';
import { api } from '../../../../utils/api';

const INTERVIEW_STEPS = [
  { id: 1, name: 'Shortlisted', value: 'shortlisted'},
  { id: 2, name: 'Test', value: 'test', icon: '✏️' },
  { id: 3, name: 'Interview', value: 'interview', icon: '🎤' },
  { id: 4, name: 'Offer', value: 'offer', icon: '📄' },
  { id: 5, name: 'Hired', value: 'hired', icon: '🎉' },
];

export default function StepDropdown({ candidate, onStepUpdate, onSkipStep }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentStepObj = INTERVIEW_STEPS.find(s => s.value === candidate.interviewStep);
  const currentStepIndex = INTERVIEW_STEPS.findIndex(s => s.value === candidate.interviewStep);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleStepSelect = async (step) => {
    setIsLoading(true);
    try {
      const response = await api.updateInterviewStep(candidate._id, {
        interviewStep: step.value,
        interviewStatus: 'in progress',
      });
      
      if (response.success) {
        onStepUpdate(response.data);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error updating step:', err);
      alert('Failed to update step');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const currentIdx = INTERVIEW_STEPS.findIndex(s => s.value === candidate.interviewStep);
      const nextStep = currentIdx < INTERVIEW_STEPS.length - 1
        ? INTERVIEW_STEPS[currentIdx + 1]
        : INTERVIEW_STEPS[INTERVIEW_STEPS.length - 1];

      const response = await api.updateInterviewStep(candidate._id, {
        interviewStep: nextStep.value,
        interviewStatus: 'skipped',
      });

      if (response.success) {
        onStepUpdate(response.data);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error skipping step:', err);
      alert('Failed to skip step');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block w-full">
      <button
        onClick={toggleDropdown}
        disabled={isLoading}
        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg flex items-center justify-between text-sm font-medium transition-colors"
      >
        <span className="flex items-center gap-2">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Move Step
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-40">
          <div className="max-h-72 overflow-y-auto">
            {/* Current step */}
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Current Step</p>
              <div className="w-full mt-2 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium text-sm flex items-center justify-between">
                <span>{currentStepObj?.icon} {currentStepObj?.name}</span>
                <Check className="w-4 h-4" />
              </div>
            </div>

            {/* Available steps */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Move to</p>
              <div className="space-y-1">
                {INTERVIEW_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = step.value === candidate.interviewStep;
                  const isNext = idx === currentStepIndex + 1;

                  return (
                    <button
                      key={step.value}
                      onClick={() => handleStepSelect(step)}
                      disabled={isCurrent || isLoading}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                          : isCompleted
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : isNext
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <span>{step.icon}</span>
                      <span className="flex-1 text-left">{step.name}</span>
                      {isCompleted && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skip step option */}
            <div className="border-t border-slate-200 px-4 py-3">
              <button
                onClick={handleSkip}
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 text-amber-700 hover:bg-amber-50 disabled:text-slate-400 transition-colors border border-amber-200"
              >
                <Zap className="w-4 h-4" />
                Skip This Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
