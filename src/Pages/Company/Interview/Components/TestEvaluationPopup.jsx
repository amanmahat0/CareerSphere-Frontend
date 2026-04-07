import React, { useState } from 'react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../../../utils/api';

export default function TestEvaluationPopup({ candidate, onClose, onUpdate, onTestEvaluated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(candidate.testResult || 'pass');
  const [feedback, setFeedback] = useState(candidate.testFeedback || '');

  const handleCompleteTest = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback');
      return;
    }

    setIsLoading(true);
    try {
      const updatePayload = {
        testResult: testResult,
        testFeedback: feedback,
        interviewStatus: 'completed',
      };

      const response = await api.updateInterviewStep(candidate._id, updatePayload);

      if (response.success) {
        const message = testResult === 'pass'
          ? 'Test result saved! Select next step.'
          : 'Test result saved! Select next step.';
        alert(message);
        onTestEvaluated ? onTestEvaluated(response.data) : onUpdate(response.data);
      }
    } catch (err) {
      console.error('Error completing test:', err);
      alert('Failed to complete test evaluation');
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
            <h2 className="text-xl font-bold text-slate-800">Evaluate Test</h2>
            <p className="text-sm text-slate-500 mt-1">Review test results for {candidate.userId?.fullname}</p>
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
          {/* Test Result */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-3">Result</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTestResult('pass')}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  testResult === 'pass'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <CheckCircle className={testResult === 'pass' ? 'text-blue-600' : 'text-slate-400'} size={20} />
                <span className={testResult === 'pass' ? 'text-blue-700 font-semibold' : 'text-slate-600'}>Pass</span>
              </button>

              <button
                onClick={() => setTestResult('fail')}
                className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  testResult === 'fail'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <XCircle className={testResult === 'fail' ? 'text-red-600' : 'text-slate-400'} size={20} />
                <span className={testResult === 'fail' ? 'text-red-700 font-semibold' : 'text-slate-600'}>Fail</span>
              </button>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback on the test performance..."
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
            onClick={handleCompleteTest}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Complete Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}