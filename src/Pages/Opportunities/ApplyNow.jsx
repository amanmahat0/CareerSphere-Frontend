import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';

const ApplyModal = ({ job, onClose, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);
  const [resumeError, setResumeError] = useState(null);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const maxChars = 500;

  // Fetch user's resume on component mount
  useEffect(() => {
    const loadResume = async () => {
      setIsLoadingResume(true);
      try {
        const response = await api.getResume();
        if (response.success && response.data) {
          setResumeData(response.data);
          
          // Check if resume is complete
          if (!response.data.isComplete) {
            // Check what's missing
            const missingFields = [];
            if (!response.data.personalInfo?.name || !response.data.personalInfo?.email || !response.data.personalInfo?.phone) {
              missingFields.push('Personal Information');
            }
            if (!response.data.education || response.data.education.length === 0) {
              missingFields.push('Education');
            }
            if (!response.data.experience || response.data.experience.length === 0) {
              missingFields.push('Work Experience');
            }
            if (!response.data.skills || response.data.skills.length === 0) {
              missingFields.push('Skills');
            }
            
            const missingText = missingFields.length > 0 ? `: ${missingFields.join(', ')}` : '';
            setResumeError(`Your resume is incomplete${missingText}. Please complete your resume before applying.`);
          }
        } else {
          setResumeError('No resume found. Please complete your resume in the Resume Builder first.');
        }
      } catch (err) {
        console.error('Error loading resume:', err);
        setResumeError('Unable to load your resume. Please ensure your resume is saved and try again.');
      } finally {
        setIsLoadingResume(false);
      }
    };
    
    loadResume();
  }, []);

  const handleTextChange = (e) => {
    if (e.target.value.length <= maxChars) {
      setCoverLetter(e.target.value);
    }
  };

  const handleSubmit = async () => {
    if (!coverLetter.trim()) {
      setError('Please write a cover letter before submitting.');
      return;
    }

    if (!resumeData) {
      setError('Your resume is not ready. Please complete your resume first.');
      return;
    }

    if (!resumeData.isComplete) {
      setError('Your resume is incomplete. Please complete all required sections before applying.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.submitJobApplication(job._id || job.id, coverLetter);

      if (response.success) {
        setError(null);
        alert('✓ Application submitted successfully!');
        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 font-sans z-50">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[550px] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-[22px] font-semibold text-gray-800">
            Apply for {job?.title || 'Position'}
          </h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 space-y-6">
          
          {/* Error Alert */}
          {error && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex gap-3 items-start">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[14px] text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Cover Letter Field */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Why are you applying for this position? <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border border-gray-100 bg-gray-50/50 rounded-lg p-3 text-[15px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows="4"
              placeholder="Explain why you're interested in this position and what makes you a good fit..."
              value={coverLetter}
              onChange={handleTextChange}
              disabled={loading}
            />
            <div className="text-sm text-gray-500 mt-2">
              {coverLetter.length}/{maxChars} characters
            </div>
          </div>

          {/* Resume Section */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Resume <span className="text-red-500">*</span>
            </label>
            
            {isLoadingResume ? (
              <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-gray-800">Loading Resume...</p>
                    <p className="text-[13px] text-gray-500">Please wait a moment</p>
                  </div>
                </div>
              </div>
            ) : resumeError ? (
              <div className="border border-orange-200 bg-orange-50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[15px] font-medium text-orange-900 mb-2">Resume Incomplete</p>
                  <p className="text-[13px] text-orange-800 mb-3">{resumeError}</p>
                  <a 
                    href="/applicant/resume"
                    className="inline-block text-[13px] font-medium text-orange-600 hover:text-orange-700 underline"
                  >
                    Go to Resume Builder →
                  </a>
                </div>
              </div>
            ) : resumeData && resumeData.isComplete ? (
              <div className="border border-green-200 bg-[#f4fcf6] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-gray-800">{resumeData.personalInfo?.name || 'Your Resume'}</p>
                    <p className="text-[13px] text-gray-500">Resume Complete</p>
                  </div>
                </div>
                <CheckCircle2 size={22} className="text-green-500" />
              </div>
            ) : (
              <div className="border border-yellow-200 bg-yellow-50 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[15px] font-medium text-yellow-900 mb-2">Resume Not Complete</p>
                  <p className="text-[13px] text-yellow-800 mb-3">Your resume needs to be completed before you can apply. Please make sure all required sections are filled.</p>
                  <a 
                    href="/applicant/resume"
                    className="inline-block text-[13px] font-medium text-yellow-600 hover:text-yellow-700 underline"
                  >
                    Complete Resume →
                  </a>
                </div>
              </div>
            )}
            
            <p className="text-[13px] text-gray-500 mt-2">
              Your resume from the Resume Builder will be automatically attached.
            </p>
          </div>

          {/* Alert Box */}
          <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-4 flex gap-3 items-start">
            <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] text-gray-800 mb-1.5">Before submitting:</p>
              <ul className="list-disc list-inside text-[14px] text-gray-600 space-y-1">
                <li>Make sure your resume is up-to-date</li>
                <li>All information provided is accurate</li>
                <li>You can update your resume anytime from Dashboard</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 mt-2 flex gap-4">
          <button 
            onClick={handleSubmit}
            disabled={loading || !resumeData || !resumeData.isComplete || isLoadingResume}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-[15px] flex items-center justify-center gap-2"
            title={!resumeData ? 'Resume not loaded' : !resumeData.isComplete ? 'Complete your resume to apply' : 'Submit application'}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-[15px]"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default ApplyModal;