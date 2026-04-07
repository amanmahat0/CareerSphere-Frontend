import React, { useState } from 'react';
import { X, Building2, MapPin, Calendar, Briefcase, Check } from 'lucide-react';
import { api } from '../../../utils/api';

const ApplicationDetailsModal = ({ application, onClose }) => {
  const [appData] = useState(application);

  if (!appData) return null;

  const job = appData.jobId || {};
  const status = appData.status || 'pending';
  const interviewStep = appData.interviewStep || null;
  
  // Determine current step
  const currentStep = (() => {
    if (interviewStep) return interviewStep;
    if (status === 'shortlisted') return 'shortlisted';
    return null;
  })();

  const statusColors = {
    pending: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Pending' },
    shortlisted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Shortlisted' },
    accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  };

  const interviewSteps = [
    { key: 'shortlisted', label: 'Shortlisted', color: 'blue' },
    { key: 'test', label: 'Test', color: 'purple' },
    { key: 'interview', label: 'Interview', color: 'orange' },
    { key: 'offer', label: 'Offer', color: 'yellow' },
    { key: 'hired', label: 'Hired', color: 'green' },
  ];

  const getStepColor = (step) => {
    switch (step?.toLowerCase()) {
      case 'shortlisted':
      case 'test':
      case 'interview':
      case 'offer':
      case 'hired':
        return 'bg-blue-600 text-white border-blue-700';
      default:
        return 'bg-slate-400 text-white border-slate-500';
    }
  };

  const statusStyle = statusColors[status] || statusColors.pending;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInterviewStepDetails = () => {
    let currentStep = interviewStep;
    
    // Determine current step based on status if no specific interviewStep
    if (!currentStep) {
      if (status === 'shortlisted') {
        currentStep = 'shortlisted';
      }
    }

    if (!currentStep) return null;
    
    switch(currentStep) {
      case 'shortlisted':
        return {
          title: 'Shortlisted',
          details: 'Congratulations! You have been shortlisted. Waiting for next steps.'
        };
      case 'test':
        return {
          title: 'Test Assignment',
          details: appData.testDeadline ? `Due: ${formatDate(appData.testDeadline)}` : 'Pending',
          link: appData.testLink || null
        };
      case 'interview':
        return {
          title: 'Interview Scheduled',
          details: appData.interviewDate ? `${formatDate(appData.interviewDate)} at ${appData.interviewTime || 'Time TBA'}` : 'Scheduled',
          location: appData.interviewLocation || 'Location TBA',
          meetingLink: appData.interviewMeetingLink || null
        };
      case 'offer':
        return {
          title: 'Offer Extended',
          details: `${appData.offerDetails || 'Awaiting your response'}`,
          deadline: appData.offerDeadline ? `Respond by: ${formatDate(appData.offerDeadline)}` : null
        };
      case 'hired':
        return {
          title: 'Hired',
          details: 'Congratulations! You are hired.',
          startDate: appData.startDate ? `Start Date: ${formatDate(appData.startDate)}` : null,
          details2: appData.hiringSummary || null
        };
      default:
        return null;
    }
  };

  const interviewDetails = getInterviewStepDetails();
  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden max-h-[95vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{job.title || 'Job Title'}</h2>
            <p className="text-sm text-slate-600 mt-1">Application details</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>



        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Badges */}
          <div className="flex gap-3">
            <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded shadow-sm">
              {job.type || 'Job'}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-2">
            <div className="flex items-center text-slate-600">
              <Building2 size={16} className="mr-2 text-slate-400" />
              <span className="text-sm">{job.company || 'Company Name'}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <MapPin size={16} className="mr-2 text-slate-400" />
              <span className="text-sm">{job.location || 'Location'}</span>
            </div>
            <div className="flex items-center text-slate-600">
              <Calendar size={16} className="mr-2 text-slate-400" />
              <span className="text-sm">Applied: {formatDate(appData.appliedDate)}</span>
            </div>
          </div>

          {/* Interview Step Progress */}
          {status !== 'pending' && (
            <div className="space-y-4 bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Interview Progress</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {(() => {
                    let currentStep = interviewStep;
                    if (!currentStep) {
                      if (status === 'shortlisted') {
                        currentStep = 'shortlisted';
                      }
                    }
                    return interviewSteps.find(s => s.key === currentStep)?.label || 'In Progress';
                  })()}
                </span>
              </div>

              {/* Progress Timeline */}
              <div className="flex items-center gap-0.5 overflow-x-auto pb-2">
                {interviewSteps.map((step, index) => {
                  // Determine current step
                  let currentStep = interviewStep;
                  if (!currentStep) {
                    if (status === 'shortlisted') {
                      currentStep = 'shortlisted';
                    }
                  }

                  const isActive = currentStep === step.key;
                  const isPast = interviewSteps.findIndex(s => s.key === currentStep) > index;
                  const isCompleted = isPast || (isActive && status !== 'pending');
                  
                  // Determine colors based on status - use single blue color
                  let stepColor = 'bg-slate-200 text-slate-600 border-slate-300';
                  if (isCompleted && !isActive) {
                    stepColor = 'bg-blue-600 text-white border-blue-700'; // Completed steps - filled blue
                  } else if (isActive) {
                    stepColor = 'bg-blue-600 text-white border-blue-700'; // Current step - blue
                  }

                  return (
                    <div key={step.key} className="flex items-center gap-1 shrink-0">
                      {/* Step Badge */}
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-semibold border-2 transition-all whitespace-nowrap
                        ${stepColor}
                      `}>
                        {isCompleted && !isActive ? (
                          <Check size={12} className="inline" />
                        ) : (
                          step.label
                        )}
                      </div>

                      {/* Connector Line */}
                      {index < interviewSteps.length - 1 && (
                        <div className={`h-1 flex-1 min-w-8 rounded-full transition-all ${
                          isCompleted || isActive ? 'bg-blue-600' : 'bg-slate-200'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Current Step Details */}
              {interviewDetails && (
                <div className={`rounded-lg p-4 border-l-4 border-blue-400 flex items-start gap-3 shadow-sm mt-3 bg-blue-50`}>
                  <div className="text-sm flex-1">
                    <p className="font-semibold text-slate-900 mb-2">{interviewDetails.title}</p>
                    
                    {/* Shortlisted Step */}
                    {currentStep === 'shortlisted' && (
                      <div className="space-y-1 text-slate-700">
                        <p>{interviewDetails.details}</p>
                      </div>
                    )}
                    
                    {/* Test Step Info */}
                    {currentStep === 'test' && (
                      <div className="space-y-2 text-slate-700">
                        <p><span className="font-medium">Deadline:</span> {interviewDetails.details}</p>
                        {appData.testMode && <p><span className="font-medium">Mode:</span> {appData.testMode}</p>}
                        {appData.testDescription && <p><span className="font-medium">Description:</span> {appData.testDescription}</p>}
                        {appData.testLocation && <p><span className="font-medium">Location:</span> {appData.testLocation}</p>}
                        {interviewDetails.link && (
                          <a href={interviewDetails.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium block mt-2">
                            → Access Test Link
                          </a>
                        )}
                      </div>
                    )}
                    
                    {/* Interview Step Info */}
                    {currentStep === 'interview' && (
                      <div className="space-y-2 text-slate-700">
                        <p><span className="font-medium">Date & Time:</span> {interviewDetails.details}</p>
                        <p><span className="font-medium">Type:</span> {appData.interviewType || 'N/A'}</p>
                        <p><span className="font-medium">Location:</span> {interviewDetails.location}</p>
                        {appData.interviewNotes && <p><span className="font-medium">Notes:</span> {appData.interviewNotes}</p>}
                        {interviewDetails.meetingLink && (
                          <a href={interviewDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium block mt-2">
                            → Join Video Call
                          </a>
                        )}
                      </div>
                    )}

                    {/* Offer Step Info */}
                    {currentStep === 'offer' && (
                      <div className="space-y-2 text-slate-700">
                        {appData.salary && <p><span className="font-medium">Salary:</span> {appData.currency || ''} {appData.salary}</p>}
                        {appData.joiningDate && <p><span className="font-medium">Joining Date:</span> {formatDate(appData.joiningDate)}</p>}
                        {appData.benefits && <p><span className="font-medium">Benefits:</span> {appData.benefits}</p>}
                        {appData.contractFile && (
                          <a href={appData.contractFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium block mt-2">
                            → View Contract
                          </a>
                        )}
                      </div>
                    )}

                    {/* Hired Step Info */}
                    {currentStep === 'hired' && (
                      <div className="space-y-2 text-slate-700">
                        <p>{interviewDetails.details}</p>
                        {appData.startDate && (
                          <p><span className="font-medium">Start Date:</span> {formatDate(appData.startDate)}</p>
                        )}
                        {appData.hiredDate && (
                          <p><span className="font-medium">Hired Date:</span> {formatDate(appData.hiredDate)}</p>
                        )}
                        {interviewDetails.details2 && (
                          <p><span className="font-medium">Summary:</span> {interviewDetails.details2}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-slate-200 bg-white">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ApplicationDetailsModal;