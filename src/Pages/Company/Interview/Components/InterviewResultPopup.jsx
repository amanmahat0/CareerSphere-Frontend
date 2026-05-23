import React, { useState } from 'react';
import { X, Loader2, CheckCircle, XCircle, Plus, Trash2, User } from 'lucide-react';
import { api } from '../../../../utils/api';
import { toast } from '../../../../utils/toast';

export default function InterviewResultPopup({ candidate, onClose, onUpdate, onInterviewCompleted }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(candidate.interviewResult || 'selected');
  const [feedback, setFeedback] = useState(candidate.interviewFeedback || '');
  
  // Multi-interviewer support
  const [interviewers, setInterviewers] = useState(
    candidate.interviewers || [{ name: '', feedback: '' }]
  );

  const handleAddInterviewer = () => {
    setInterviewers([...interviewers, { name: '', feedback: '' }]);
  };

  const handleRemoveInterviewer = (index) => {
    if (interviewers.length > 1) {
      setInterviewers(interviewers.filter((_, i) => i !== index));
    }
  };

  const handleInterviewerChange = (index, field, value) => {
    const updated = [...interviewers];
    updated[index][field] = value;
    setInterviewers(updated);
  };

  const handleCompleteInterview = async () => {
    if (!feedback.trim()) {
      toast.error('Please provide overall interview feedback');
      return;
    }

    // Check if all interviewers have names and feedback
    const validInterviewers = interviewers.filter(
      iv => iv.name && iv.feedback
    );

    if (validInterviewers.length === 0) {
      toast.error('Please add at least one interviewer with feedback');
      return;
    }

    setIsLoading(true);
    try {
      const updatePayload = {
        interviewResult: result,
        interviewFeedback: feedback,
        interviewStatus: 'completed',
        interviewers: validInterviewers,
      };

      const response = await api.updateInterviewStep(candidate._id, updatePayload);

      if (response.success) {
        if (result === 'selected') {
          toast.success('Interview PASSED! Candidate moved to Offer Stage.');
        } else {
          toast.error('Interview REJECTED! Candidate application rejected.');
        }
        onInterviewCompleted ? onInterviewCompleted(response.data) : onUpdate(response.data);
        onClose();
      }
    } catch (err) {
      console.error('Error completing interview:', err);
      toast.error('Failed to record interview result');
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
            <h2 className="text-xl font-bold text-slate-800">Interview Result</h2>
            <p className="text-sm text-slate-500 mt-1">Record result for {candidate.userId?.fullname}</p>
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
          {/* Interview Result */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-3">Overall Result</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setResult('selected')}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  result === 'selected'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <CheckCircle className={result === 'selected' ? 'text-blue-600' : 'text-slate-400'} size={20} />
                <span className={result === 'selected' ? 'text-blue-700 font-semibold' : 'text-slate-600'}>Selected</span>
              </button>

              <button
                onClick={() => setResult('rejected')}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  result === 'rejected'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <XCircle className={result === 'rejected' ? 'text-red-600' : 'text-slate-400'} size={20} />
                <span className={result === 'rejected' ? 'text-red-700 font-semibold' : 'text-slate-600'}>Rejected</span>
              </button>
            </div>
          </div>

          {/* Overall Feedback */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Overall Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide overall interview feedback and notes..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          {/* Multi-Interviewer Feedback Section */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <User size={16} />
                Interviewer Feedback
              </h3>
              <button
                onClick={handleAddInterviewer}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                Add Interviewer
              </button>
            </div>

            <div className="space-y-4">
              {interviewers.map((interviewer, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <label className="text-xs font-bold text-slate-700">Interviewer {index + 1}</label>
                    {interviewers.length > 1 && (
                      <button
                        onClick={() => handleRemoveInterviewer(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={interviewer.name}
                      onChange={(e) => handleInterviewerChange(index, 'name', e.target.value)}
                      placeholder="Interviewer name"
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />

                    <textarea
                      value={interviewer.feedback}
                      onChange={(e) => handleInterviewerChange(index, 'feedback', e.target.value)}
                      placeholder="Feedback from this interviewer..."
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCompleteInterview}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Complete Interview
          </button>
        </div>
      </div>
    </div>
  );
}