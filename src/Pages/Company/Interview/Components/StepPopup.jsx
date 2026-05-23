import React, { useState } from 'react';
import { X, ChevronLeft, AlertCircle, Loader2, Clock, XCircle } from 'lucide-react';
import { api } from '../../../../utils/api';
import { toast } from '../../../../utils/toast';
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
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [revertLoading, setRevertLoading] = useState(false);
  const [revertError, setRevertError] = useState(null);
  const [revertReason, setRevertReason] = useState('');

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
    // Offer step: show different views based on applicant's response
    if (step === 'offer') {
      if (candidate.offerResponse === 'accepted') return 'hiringConfirmation';
      if (candidate.offerResponse === 'rejected') return 'offerRejected';
      return 'offerWaiting';
    }
    // If on hired step, show confirmation
    if (step === 'hired') {
      return 'hiringConfirmation';
    }
    // Default to step selection
    return 'stepSelection';
  }

  const getPreviousStep = (currentStep) => {
    const stepOrder = ['shortlisted', 'test', 'interview', 'offer', 'hired'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex <= 0) return null;
    return stepOrder[currentIndex - 1];
  };

  const handleRevertStep = async () => {
    if (!revertReason.trim()) {
      setRevertError('Please provide a reason for reversion');
      return;
    }

    setRevertLoading(true);
    setRevertError(null);

    try {
      const response = await api.updateInterviewStep(localCandidate._id, {
        interviewStep: getPreviousStep(localCandidate.interviewStep),
        revertReason: revertReason,
        auditLog: {
          action: 'step_reverted',
          fromStep: localCandidate.interviewStep,
          toStep: getPreviousStep(localCandidate.interviewStep),
          reason: revertReason,
          revertedByEmail: 'current_user_email', // This should come from context
          revertedAt: new Date(),
        }
      });

      if (response.success) {
        setLocalCandidate(response.data);
        onUpdate(response.data);
        setShowRevertModal(false);
        // Return to step selection after reversion
        setActivePopup('stepSelection');
      }
    } catch (error) {
      setRevertError(error.message || 'Failed to revert step');
    } finally {
      setRevertLoading(false);
    }
  };

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
    
    // If test PASSED → Move to interview scheduling
    if (updatedData.testResult === "pass") {
      setActivePopup('interviewScheduling');
    } 
    // If test FAILED → Close popup (application rejected)
    else if (updatedData.testResult === "fail") {
      toast.info("Application has been rejected due to failed test.");
      onClose();
    }
  };

  const handleInterviewCompleted = (updatedData) => {
    setLocalCandidate(updatedData);
    
    // If interview PASSED (selected) → Move to offer sending
    if (updatedData.interviewResult === "selected") {
      setActivePopup('offerSending');
    }
    // If interview FAILED (rejected) → Close popup (application rejected)
    else if (updatedData.interviewResult === "rejected") {
      toast.info("Application has been rejected due to failed interview.");
      onClose();
    }
  };

  const handleOfferResponseCompleted = (updatedData) => {
    setLocalCandidate(updatedData);
    
    // If offer ACCEPTED → Move to hiring confirmation
    if (updatedData.offerResponse === "accepted") {
      setActivePopup('hiringConfirmation');
    }
    // If offer REJECTED → Close popup (application rejected)
    else if (updatedData.offerResponse === "rejected") {
      toast.info("Applicant has rejected the offer.");
      onClose();
    }
  };

  const handleInterviewScheduled = (updatedData) => {
    setLocalCandidate(updatedData);
    // After scheduling, move to interview result evaluation
    setActivePopup('interviewResult');
  };

  const handleOfferSent = (updatedData) => {
    setLocalCandidate(updatedData);
    // Offer sent — wait for applicant to respond from their dashboard
    setActivePopup('offerWaiting');
  };

  const handleCloseAndRefresh = () => {
    onClose();
  };

  const canRevert = ['test', 'interview', 'offer', 'hired'].includes(localCandidate.interviewStep);

  const PopupWrapper = ({ children, title, showRevertButton }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header with Revert Button */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <div className="flex items-center gap-2">
            {showRevertButton && canRevert && (
              <button
                onClick={() => setShowRevertModal(true)}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-slate-200"
              >
                <ChevronLeft size={16} />
                Revert Step
              </button>
            )}
            <button
              onClick={handleCloseAndRefresh}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

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
        onInterviewScheduled={handleInterviewScheduled}
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
        onOfferSent={handleOfferSent}
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
        onOfferResponseCompleted={handleOfferResponseCompleted}
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

  // Offer Waiting - offer sent, awaiting applicant response
  if (activePopup === 'offerWaiting') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Offer Sent</h2>
            <button onClick={handleCloseAndRefresh} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Awaiting applicant response</p>
                <p className="text-sm text-amber-700 mt-1">
                  The offer has been sent to <span className="font-semibold">{localCandidate.userId?.fullname}</span>. They will be notified and can accept or decline from their dashboard. Come back here once they respond.
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseAndRefresh}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Offer Rejected - applicant declined the offer
  if (activePopup === 'offerRejected') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Offer Declined</h2>
            <button onClick={handleCloseAndRefresh} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">{localCandidate.userId?.fullname} declined the offer</p>
                {localCandidate.offerResponseNotes && (
                  <p className="text-sm text-red-700 mt-1">Note: {localCandidate.offerResponseNotes}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleCloseAndRefresh}
              className="w-full px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <>
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

      {/* Revert Modal */}
      {showRevertModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle size={20} className="text-yellow-600" />
              Revert Interview Step
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              This will move the candidate back to the <span className="font-semibold">{getPreviousStep(localCandidate.interviewStep)}</span> step. Please explain why:
            </p>

            {revertError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium mb-4">
                {revertError}
              </div>
            )}

            <textarea
              value={revertReason}
              onChange={(e) => setRevertReason(e.target.value)}
              placeholder="Enter reason for reversion..."
              maxLength={300}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none h-24 text-sm"
            />
            <p className="text-xs text-slate-500 mt-2">{revertReason.length}/300 characters</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRevertModal(false);
                  setRevertReason('');
                  setRevertError(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevertStep}
                disabled={revertLoading || !revertReason.trim()}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {revertLoading ? <Loader2 size={14} className="animate-spin" /> : <ChevronLeft size={14} />}
                Revert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
