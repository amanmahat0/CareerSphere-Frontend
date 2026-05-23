import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertTriangle, Check } from 'lucide-react';
import { api } from '../../../../utils/api';
import { toast } from '../../../../utils/toast';

export default function InterviewSchedulingPopup({ candidate, onClose, onUpdate, onInterviewScheduled }) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [formData, setFormData] = useState({
    interviewType: candidate.interviewType || 'online',
    interviewDate: candidate.interviewDate ? candidate.interviewDate.split('T')[0] : '',
    interviewTime: candidate.interviewTime || '',
    meetingLink: candidate.meetingLink || '',
    interviewLocation: candidate.interviewLocation || '',
    notes: candidate.interviewNotes || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check for conflicts when date or time changes
  useEffect(() => {
    const checkForConflicts = async () => {
      if (!formData.interviewDate || !formData.interviewTime) {
        setConflicts([]);
        return;
      }

      setCheckingConflicts(true);
      try {
        const dateStr = formData.interviewDate; // YYYY-MM-DD
        const response = await api.getScheduleForDate(dateStr);
        
        if (response.success && response.data) {
          // Parse the time to get hour
          const [hours, minutes] = formData.interviewTime.split(':');
          const selectedHour = parseInt(hours);
          
          // Check for conflicts (same date, same hour)
          const conflictingSchedules = response.data.filter(schedule => {
            const scheduleTime = new Date(schedule.interviewDate);
            const scheduleHour = scheduleTime.getHours();
            return scheduleHour === selectedHour && schedule.applicationId !== candidate._id;
          });

          setConflicts(conflictingSchedules);
          setShowConflictWarning(conflictingSchedules.length > 0);
        }
      } catch (error) {
        console.error('Error checking conflicts:', error);
      } finally {
        setCheckingConflicts(false);
      }
    };

    const debounce = setTimeout(checkForConflicts, 500);
    return () => clearTimeout(debounce);
  }, [formData.interviewDate, formData.interviewTime, candidate._id]);

  const handleScheduleInterview = async () => {
    // Validation
    if (!formData.interviewDate.trim()) {
      toast.error('Please select an interview date');
      return;
    }
    if (!formData.interviewTime.trim()) {
      toast.error('Please enter interview time');
      return;
    }
    if (formData.interviewType === 'online' && !formData.meetingLink.trim()) {
      toast.error('Please provide meeting link for online interview');
      return;
    }
    if (formData.interviewType === 'offline' && !formData.interviewLocation.trim()) {
      toast.error('Please provide location for offline interview');
      return;
    }

    setIsLoading(true);
    try {
      const updatePayload = {
        interviewStep: 'interview',
        interviewStatus: 'scheduled',
        interviewType: formData.interviewType,
        interviewDate: new Date(formData.interviewDate).toISOString(),
        interviewTime: formData.interviewTime,
        meetingLink: formData.interviewType === 'online' ? formData.meetingLink : null,
        interviewLocation: formData.interviewType === 'offline' ? formData.interviewLocation : null,
        interviewNotes: formData.notes,
      };

      const response = await api.updateInterviewStep(candidate._id, updatePayload);

      if (response.success) {
        toast.success('Interview scheduled successfully!');
        // Call the special handler to move to interview result evaluation
        if (onInterviewScheduled) {
          onInterviewScheduled(response.data);
        } else {
          onUpdate(response.data);
          onClose();
        }
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      toast.error('Failed to schedule interview');
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
            <h2 className="text-xl font-bold text-slate-800">Schedule Interview</h2>
            <p className="text-sm text-slate-500 mt-1">Configure interview for {candidate.userId?.fullname}</p>
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
          
          {/* Conflict Warning */}
          {showConflictWarning && conflicts.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex gap-3">
                <AlertTriangle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-900 mb-1">Schedule Conflicts Detected</p>
                  <p className="text-yellow-800 mb-2">The following interviews are scheduled at the same time:</p>
                  <ul className="space-y-1 text-yellow-800 text-xs">
                    {conflicts.map((conflict, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-yellow-600 rounded-full"></span>
                        {conflict.userId?.fullname} - {conflict.jobId?.title}
                      </li>
                    ))}
                  </ul>
                  <p className="text-yellow-800 text-xs mt-2">Consider rescheduling to avoid conflicts.</p>
                </div>
              </div>
            </div>
          )}

          {/* Interview Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Interview Type</label>
            <div className="flex gap-4">
              {['online', 'offline'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="interviewType"
                    value={type}
                    checked={formData.interviewType === type}
                    onChange={(e) => handleChange('interviewType', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700 capitalize">
                    {type === 'online' ? 'Online' : 'In-Person'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Interview Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Interview Date</label>
            <input
              type="date"
              value={formData.interviewDate}
              onChange={(e) => handleChange('interviewDate', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Interview Time - with loading indicator for conflict check */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-2">
              Interview Time
              {checkingConflicts && <Loader2 size={14} className="animate-spin text-blue-600" />}
              {!checkingConflicts && conflicts.length === 0 && formData.interviewTime && <Check size={14} className="text-green-600" />}
            </label>
            <input
              type="time"
              value={formData.interviewTime}
              onChange={(e) => handleChange('interviewTime', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Conditional Fields */}
          {formData.interviewType === 'online' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link</label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => handleChange('meetingLink', e.target.value)}
                placeholder="https://zoom.us/... or https://meet.google.com/..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          {formData.interviewType === 'offline' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.interviewLocation}
                onChange={(e) => handleChange('interviewLocation', e.target.value)}
                placeholder="e.g., Conference Room A, Floor 3"
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional instructions or information..."
              rows={3}
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
            onClick={handleScheduleInterview}
            disabled={isLoading || (showConflictWarning && conflicts.length > 0 && !window.confirm('Conflicts detected. Continue anyway?'))}
            className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Schedule Interview
          </button>
        </div>
      </div>
    </div>
  );
}
