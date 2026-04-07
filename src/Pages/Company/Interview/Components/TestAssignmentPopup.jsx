import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { api } from '../../../../utils/api';

export default function TestAssignmentPopup({ candidate, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    testType: candidate.testType || 'skill_assessment',
    description: candidate.description || '',
    testDeadline: candidate.testDeadline ? candidate.testDeadline.split('T')[0] : '',
    testMode: candidate.testMode || 'online',
    testLink: candidate.testLink || '',
    testLocation: candidate.testLocation || '',
  });

  const testTypes = [
    { value: 'skill_assessment', label: 'Skill Assessment' },
    { value: 'coding_test', label: 'Coding Test' },
    { value: 'aptitude_test', label: 'Aptitude Test' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssignTest = async () => {
    // Validation
    if (!formData.testDeadline.trim()) {
      alert('Please select a deadline');
      return;
    }

    setIsLoading(true);
    try {
      const updatePayload = {
        interviewStep: 'test',
        interviewStatus: 'in progress',
        testType: formData.testType,
        description: formData.description,
        testDeadline: new Date(formData.testDeadline).toISOString(),
        testMode: formData.testMode,
        testLink: formData.testMode === 'online' ? formData.testLink : null,
        testLocation: formData.testMode === 'offline' ? formData.testLocation : null,
      };

      const response = await api.updateInterviewStep(candidate._id, updatePayload);

      if (response.success) {
        alert('✓ Test assigned successfully!');
        onUpdate(response.data);
        onClose();
      }
    } catch (err) {
      console.error('Error assigning test:', err);
      alert('Failed to assign test');
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
            <h2 className="text-xl font-bold text-slate-800">Assign Test</h2>
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
          {/* Test Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Test Type</label>
            <select
              value={formData.testType}
              onChange={(e) => handleChange('testType', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              {testTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., Frontend React assessment, 2 hours duration"
              rows={3}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deadline</label>
            <input
              type="date"
              value={formData.testDeadline}
              onChange={(e) => handleChange('testDeadline', e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Test Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mode</label>
            <div className="flex gap-4">
              {['online', 'offline'].map(mode => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="testMode"
                    value={mode}
                    checked={formData.testMode === mode}
                    onChange={(e) => handleChange('testMode', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700 capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Conditional Fields */}
          {formData.testMode === 'online' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Test Link</label>
              <input
                type="url"
                value={formData.testLink}
                onChange={(e) => handleChange('testLink', e.target.value)}
                placeholder="https://..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          {formData.testMode === 'offline' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.testLocation}
                onChange={(e) => handleChange('testLocation', e.target.value)}
                placeholder="e.g., Office Room 201"
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}
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
            onClick={handleAssignTest}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Assign Test
          </button>
        </div>
      </div>
    </div>
  );
}
