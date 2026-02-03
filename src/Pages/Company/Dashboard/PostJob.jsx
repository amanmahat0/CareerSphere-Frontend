import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../../utils/api';

const PostJob = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'Internship',
    location: 'Kathmandu',
    duration: '',
    description: '',
    salary: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.createJob(formData);
      console.log("Job Posted!", response);
      
      // Reset form
      setFormData({
        title: '',
        company: '',
        type: 'Internship',
        location: 'Kathmandu',
        duration: '',
        description: '',
        salary: '',
      });
      
      if (onSuccess) onSuccess(response.job);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to post job. Please try again.');
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
            <h2 className="text-xl font-bold text-slate-800">Post New Opportunity</h2>
            <p className="text-sm text-slate-500">Fill in the details for the job or internship posting</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Frontend Developer Intern" 
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company *</label>
              <input 
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter company name"
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Type *</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="Internship">Internship</option>
                <option value="Job">Job</option>
                <option value="Traineeship">Traineeship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration *</label>
              <input 
                type="text" 
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 3 months, Full-time" 
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Salary *</label>
            <input 
              type="text" 
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., NPR 6-8 Lakhs/year or Negotiable"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Job Description *</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
              rows={4}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none" 
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Posting...' : 'Post Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;