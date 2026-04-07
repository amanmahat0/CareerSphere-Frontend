import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const INTERVIEW_STEPS = [
  { id: 1, name: 'Shortlisted', value: 'shortlisted', icon: '✓' },
  { id: 2, name: 'Test', value: 'test', icon: '✏️' },
  { id: 3, name: 'Interview', value: 'interview', icon: '🎤' },
  { id: 4, name: 'Offer', value: 'offer', icon: '📄' },
  { id: 5, name: 'Hired', value: 'hired', icon: '🎉' },
];

export default function StepProgressIndicator({ currentStep, candidateName }) {
  const currentStepIndex = INTERVIEW_STEPS.findIndex(s => s.value === currentStep);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{candidateName}</h3>
        <p className="text-sm text-slate-600">Hiring Pipeline Progress</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {INTERVIEW_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.value} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  isCompleted
                    ? 'bg-green-100 text-green-700'
                    : isCurrent
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-lg font-semibold">{step.icon}</span>
                )}
              </div>

              {/* Step Name */}
              <p
                className={`text-xs font-medium text-center mb-4 ${
                  isCurrent
                    ? 'text-blue-700 font-semibold'
                    : isCompleted
                    ? 'text-green-700'
                    : 'text-slate-500'
                }`}
              >
                {step.name}
              </p>

              {/* Connector Line */}
              {index < INTERVIEW_STEPS.length - 1 && (
                <div
                  className={`absolute w-12 h-1 ml-12 -mt-8 ${
                    isCompleted ? 'bg-green-300' : 'bg-slate-200'
                  }`}
                  style={{
                    left: `calc(${(index + 1) * (100 / INTERVIEW_STEPS.length)}% - 24px)`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Info */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="text-sm font-medium text-slate-700 mb-2">Current Step</div>
        <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-700 font-medium">
            {INTERVIEW_STEPS[currentStepIndex].icon} {INTERVIEW_STEPS[currentStepIndex].name}
          </span>
        </div>
      </div>
    </div>
  );
}
