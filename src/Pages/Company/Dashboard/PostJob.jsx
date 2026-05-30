import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { api } from '../../../utils/api';

const today = () => new Date().toISOString().split('T')[0];

const REQUIRED = ['title', 'type', 'location', 'duration', 'description', 'salary'];

const PostJob = ({ isOpen, onClose, onSuccess, editJob = null }) => {
  const isEditMode = !!editJob;

  const getInitialFormData = () => ({
    title: '',
    type: 'Internship',
    location: 'Kathmandu',
    duration: '',
    description: '',
    salary: '',
    skills: '',
    deadline: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editJob) {
      setFormData({
        title: editJob.title || '',
        type: editJob.type || 'Internship',
        location: editJob.location || 'Kathmandu',
        duration: editJob.duration || '',
        description: editJob.description || '',
        salary: editJob.salary || '',
        skills: Array.isArray(editJob.skills) ? editJob.skills.join(', ') : (editJob.skills || ''),
        deadline: editJob.deadline ? editJob.deadline.split('T')[0] : '',
        requirements: Array.isArray(editJob.requirements) ? editJob.requirements.join('\n') : (editJob.requirements || ''),
        responsibilities: Array.isArray(editJob.responsibilities) ? editJob.responsibilities.join('\n') : (editJob.responsibilities || ''),
        benefits: Array.isArray(editJob.benefits) ? editJob.benefits.join('\n') : (editJob.benefits || ''),
      });
    } else {
      setFormData(getInitialFormData());
    }
    setSubmitted(false);
    setError('');
  }, [editJob, isOpen]);

  // Per-field validation
  const fieldErrors = useMemo(() => {
    const e = {};
    if (!formData.title.trim())       e.title       = 'Job title is required';
    if (!formData.location.trim())    e.location    = 'Location is required';
    if (!formData.duration.trim())    e.duration    = 'Duration is required';
    if (!formData.description.trim()) e.description = 'Job description is required';
    else if (formData.description.trim().length < 20)
      e.description = 'Description must be at least 20 characters';
    if (!formData.salary.trim())      e.salary      = 'Salary / compensation is required';
    if (formData.deadline) {
      if (formData.deadline < today()) e.deadline = 'Deadline cannot be a past date';
    }
    return e;
  }, [formData]);

  const isFormValid = () => Object.keys(fieldErrors).length === 0;

  const showErr = (field) => {
    const err = fieldErrors[field];
    if (!err) return null;
    // Show required errors only after first submit attempt; show format errors live
    if (submitted) return err;
    const hasValue = formData[field]?.toString().trim();
    if (hasValue && !err.toLowerCase().includes('required')) return err;
    return null;
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isFormValid()) {
      setError('Please fix the errors above before submitting.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const jobData = {
        title: formData.title.trim(),
        type: formData.type,
        location: formData.location.trim(),
        duration: formData.duration.trim(),
        description: formData.description.trim(),
        salary: formData.salary.trim(),
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        requirements: formData.requirements ? formData.requirements.split('\n').map(s => s.trim()).filter(Boolean) : [],
        responsibilities: formData.responsibilities ? formData.responsibilities.split('\n').map(s => s.trim()).filter(Boolean) : [],
        benefits: formData.benefits ? formData.benefits.split('\n').map(s => s.trim()).filter(Boolean) : [],
      };
      if (formData.deadline) jobData.deadline = formData.deadline;

      let response;
      if (isEditMode) {
        response = await api.updateJob(editJob._id, jobData);
      } else {
        response = await api.createJob(jobData);
      }

      setFormData(getInitialFormData());
      if (onSuccess) onSuccess(response.job);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to post job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const Field = ({ label, required, error: err, children }) => (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {err && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle size={11} /> {err}
        </p>
      )}
    </div>
  );

  const inputCls = (field) =>
    `w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
      showErr(field)
        ? 'border-red-400 focus:border-red-400 bg-red-50/30'
        : 'border-slate-200 focus:border-blue-500 bg-white'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEditMode ? 'Edit Opportunity' : 'Post New Opportunity'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode ? 'Update the details for this posting' : 'Fill in the details for the job or internship'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors ml-4">
            <X size={20} />
          </button>
        </div>

        {/* Global error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">

          <Field label="Job Title" required error={showErr('title')}>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Frontend Developer Intern"
              className={inputCls('title')}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Type <span className="text-red-500">*</span></label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <option value="Internship">Internship</option>
                <option value="Job">Job</option>
                <option value="Traineeship">Traineeship</option>
              </select>
            </div>
            <Field label="Location" required error={showErr('location')}>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Kathmandu"
                className={inputCls('location')}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration" required error={showErr('duration')}>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 3 months, Full-time"
                className={inputCls('duration')}
              />
            </Field>
            <Field label="Application Deadline" error={showErr('deadline')}>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                min={today()}
                className={inputCls('deadline')}
              />
            </Field>
          </div>

          <Field label="Job Description" required error={showErr('description')}>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
              rows={4}
              className={inputCls('description') + ' resize-none'}
            />
            <p className="text-xs text-slate-400 mt-1">{formData.description.trim().length} / 20+ chars</p>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js (comma-separated)"
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <Field label="Salary / Compensation" required error={showErr('salary')}>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g., NPR 6–8 Lakhs or Negotiable"
                className={inputCls('salary')}
              />
            </Field>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Enter each requirement on a new line…"
              rows={3}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Responsibilities</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              placeholder="Enter each responsibility on a new line…"
              rows={3}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Benefits</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="Enter each benefit on a new line…"
              rows={3}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
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
              className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? (isEditMode ? 'Updating…' : 'Posting…')
                : (isEditMode ? 'Update Opportunity' : 'Post Opportunity')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
