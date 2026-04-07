import React, { useState } from 'react';
import { X } from 'lucide-react';
import StepSelectionPopup from './StepSelectionPopup';
import TestAssignmentPopup from './TestAssignmentPopup';
import TestEvaluationPopup from './TestEvaluationPopup';
import InterviewSchedulingPopup from './InterviewSchedulingPopup';
import InterviewResultPopup from './InterviewResultPopup';
import OfferSendingPopup from './OfferSendingPopup';
import OfferResponsePopup from './OfferResponsePopup';
import HiringConfirmationPopup from './HiringConfirmationPopup';

export default function StepPopup({ candidate, onClose, onUpdate }) {
  const [activePopup, setActivePopup] = useState(getInitialPopup(candidate.interviewStep));
  const [localCandidate, setLocalCandidate] = useState(candidate);

  function getInitialPopup(step) {
    // If just shortlisted, show step selection
    if (step === 'shortlisted') {
      return 'stepSelection';
    }
    // If on test step, show evaluation if test was completed
    if (step === 'test' && candidate.testResult) {
      return 'testEvaluation';
    }
    // If on test step without result, show evaluation to enter result
    if (step === 'test') {
      return 'testEvaluation';
    }
    // If on interview step, show result if interview was conducted
    if (step === 'interview' && candidate.interviewResult) {
      return 'interviewResult';
    }
    // If on interview step without result, show result to enter result
    if (step === 'interview') {
      return 'interviewResult';
    }
    // If on offer step, show response if waiting for decision
    if (step === 'offer' && !candidate.offerResponse) {
      return 'offerResponse';
    }
    // If on offer step with response already, show response
    if (step === 'offer') {
      return 'offerResponse';
    }
    // If on hired step, show confirmation
    if (step === 'hired') {
      return 'hiringConfirmation';
    }
    // Default to step selection
    return 'stepSelection';
  }

  const handleSelectStep = (nextStep) => {
    if (nextStep === 'test') {
      setActivePopup('testAssignment');
    } else if (nextStep === 'interview') {
      setActivePopup('interviewScheduling');
    } else if (nextStep === 'offer') {
      setActivePopup('offerSending');
    } else if (nextStep === 'hired') {
      setActivePopup('hiringConfirmation');
    }
  };

  const handleUpdate = (updatedData) => {
    setLocalCandidate(updatedData);
    onUpdate(updatedData);
  };

  const handleTestEvaluated = (updatedData) => {
    setLocalCandidate(updatedData);
    setActivePopup('interviewScheduling');
  };

  const handleInterviewCompleted = (updatedData) => {
    setLocalCandidate(updatedData);
    setActivePopup('stepSelection');
  };

  const handleCloseAndRefresh = () => {
    onClose();
  };

  // Step Selection - Choose next step
  if (activePopup === 'stepSelection') {
    return (
      <StepSelectionPopup
        candidate={localCandidate}
        onClose={handleCloseAndRefresh}
        onSelectStep={handleSelectStep}
      />
    );
  }

  // Test Assignment - Assign test details
  if (activePopup === 'testAssignment') {
    return (
      <TestAssignmentPopup
        candidate={localCandidate}
        onClose={handleCloseAndRefresh}
        onUpdate={handleUpdate}
      />
    );
  }

  // Test Evaluation - Evaluate test results
  if (activePopup === 'testEvaluation') {
    return (
      <TestEvaluationPopup
        candidate={localCandidate}
        onClose={handleCloseAndRefresh}
        onUpdate={handleUpdate}
        onTestEvaluated={handleTestEvaluated}
      />
    );
  }

  // Interview Scheduling - Schedule interview
  if (activePopup === 'interviewScheduling') {
    return (
      <InterviewSchedulingPopup
        candidate={localCandidate}
        onClose={handleCloseAndRefresh}
        onUpdate={handleUpdate}
      />
    );
  }

  // Interview Result - Record interview results
  if (activePopup === 'interviewResult') {
    return (
      <InterviewResultPopup
        candidate={localCandidate}
        onClose={handleCloseAndRefresh}
        onUpdate={handleUpdate}
        onInterviewCompleted={handleInterviewCompleted}
      />
    );
  }

  // Offer Sending - Send offer
  if (activePopup === 'offerSending') {
    return (
      <OfferSendingPopup
        candidate={localCandidate}
        onClose={handleCloseAndRefresh}
        onUpdate={handleUpdate}
      />
    );
  }

  // Offer Response - Record offer response
  if (activePopup === 'offerResponse') {
    return (
      <OfferResponsePopup
        candidate={localCandidate}
        onClose={handleCloseAndRefresh}
        onUpdate={handleUpdate}
      />
    );
  }

  // Hiring Confirmation - Confirm hiring
  if (activePopup === 'hiringConfirmation') {
    return (
      <HiringConfirmationPopup
        candidate={localCandidate}
        onClose={handleCloseAndRefresh}
        onUpdate={handleUpdate}
      />
    );
  }

  // Fallback
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Loading...</h2>
          <button
            onClick={handleCloseAndRefresh}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
