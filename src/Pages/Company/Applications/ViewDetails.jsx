import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Briefcase, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../../../utils/api';

const ViewDetails = ({ application, isOpen, onClose, onStatusUpdate }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Fetch full applicant details when modal opens
  useEffect(() => {
    if (isOpen && application) {
      fetchApplicantDetails();
    }
  }, [isOpen, application]);

  const fetchApplicantDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the populated data from application
      if (application.userId) {
        setUserDetails(application.userId);
      }
      if (application.resumeId) {
        setResume(application.resumeId);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
      setError('Failed to load applicant details');
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async () => {
    try {
      setUpdating(true);
      setError('');
      const response = await api.shortlistApplication(application._id);
      if (response.success) {
        if (onStatusUpdate) {
          onStatusUpdate(application._id, 'shortlisted');
        }
        alert('✓ Application shortlisted successfully! Candidate will appear in Interview Management.');
        onClose();
      }
    } catch (err) {
      console.error('Error shortlisting:', err);
      setError('Failed to shortlist applicant');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      try {
        setUpdating(true);
        setError('');
        const response = await api.rejectApplication(application._id);
        if (response.success) {
          if (onStatusUpdate) {
            onStatusUpdate(application._id, 'rejected');
          }
          alert('✓ Application rejected successfully!');
          onClose();
        }
      } catch (err) {
        console.error('Error rejecting:', err);
        setError('Failed to reject applicant');
      } finally {
        setUpdating(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600';
      case 'shortlisted':
        return 'text-blue-600';
      case 'accepted':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'shortlisted':
        return 'bg-blue-50 border-blue-200';
      case 'accepted':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-20 p-4">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-lg overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Application Details</h2>
            {application.jobId && (
              <p className="text-sm text-slate-600">
                Position: <span className="font-semibold text-slate-700">{application.jobId.title}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-white rounded-lg"
            disabled={updating}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 space-y-0">
          
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-blue-900" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full">
              {/* Resume Preview - Left Side */}
              <div className="lg:col-span-2 border-r border-slate-200 bg-white p-0 overflow-y-auto max-h-[75vh]">
                {resume && (
                  <div className="bg-white shadow-none" id="resume-preview">
                    <div className="p-8">
                      {/* Header */}
                      <div className="border-b-2 border-slate-900 pb-4 mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                          {resume.personalInfo?.name || "Name"}
                        </h1>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                          {resume.personalInfo?.email && <span>{resume.personalInfo.email}</span>}
                          {resume.personalInfo?.email && resume.personalInfo?.phone && <span>•</span>}
                          {resume.personalInfo?.phone && <span>{resume.personalInfo.phone}</span>}
                          {resume.personalInfo?.phone && resume.personalInfo?.location && <span>•</span>}
                          {resume.personalInfo?.location && <span>{resume.personalInfo.location}</span>}
                        </div>
                        {(resume.personalInfo?.linkedin || resume.personalInfo?.website) && (
                          <div className="flex flex-wrap gap-2 text-sm text-blue-600 mt-1">
                            {resume.personalInfo?.linkedin && <span>{resume.personalInfo.linkedin}</span>}
                            {resume.personalInfo?.linkedin && resume.personalInfo?.website && <span>•</span>}
                            {resume.personalInfo?.website && <span>{resume.personalInfo.website}</span>}
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      {resume.personalInfo?.summary && (
                        <div className="mb-6">
                          <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
                            Professional Summary
                          </h2>
                          <p className="text-sm text-slate-700 leading-relaxed">{resume.personalInfo.summary}</p>
                        </div>
                      )}

                      {/* Education */}
                      {resume.education && resume.education.length > 0 && resume.education.some((e) => e.degree) && (
                        <div className="mb-6">
                          <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
                            Education
                          </h2>
                          <div className="space-y-3">
                            {resume.education.map(
                              (edu, idx) =>
                                edu.degree && (
                                  <div key={idx}>
                                    <div className="flex justify-between items-start mb-1">
                                      <div>
                                        <h3 className="text-sm font-semibold text-slate-900">{edu.degree}</h3>
                                        {edu.institution && <p className="text-sm text-slate-600">{edu.institution}</p>}
                                      </div>
                                      <div className="text-right">
                                        {edu.year && <p className="text-sm text-slate-900">{edu.year}</p>}
                                        {edu.cgpa && <p className="text-sm text-slate-600">CGPA: {edu.cgpa}</p>}
                                      </div>
                                    </div>
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {resume.experience && resume.experience.length > 0 && resume.experience.some((e) => e.title) && (
                        <div className="mb-6">
                          <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
                            Experience
                          </h2>
                          <div className="space-y-3">
                            {resume.experience.map(
                              (exp, idx) =>
                                exp.title && (
                                  <div key={idx}>
                                    <div className="flex justify-between items-start mb-1">
                                      <div>
                                        <h3 className="text-sm font-semibold text-slate-900">{exp.title}</h3>
                                        {exp.company && <p className="text-sm text-slate-600">{exp.company}</p>}
                                      </div>
                                      {exp.duration && <p className="text-sm text-slate-600">{exp.duration}</p>}
                                    </div>
                                    {exp.description && (
                                      <p className="text-sm text-slate-700 leading-relaxed">{exp.description}</p>
                                    )}
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      {resume.skills && resume.skills.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
                            Skills
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            {resume.skills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded">
                                {skill.skillName || skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {resume.projects && resume.projects.length > 0 && resume.projects.some((p) => p.title) && (
                        <div className="mb-6">
                          <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
                            Projects
                          </h2>
                          <div className="space-y-3">
                            {resume.projects.map(
                              (project, idx) =>
                                project.title && (
                                  <div key={idx}>
                                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{project.title}</h3>
                                    {project.description && (
                                      <p className="text-sm text-slate-700 mb-1">{project.description}</p>
                                    )}
                                    {project.link && (
                                      <p className="text-sm text-slate-600">
                                        <span className="font-medium">Link:</span> {project.link}
                                      </p>
                                    )}
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {resume.certifications && resume.certifications.length > 0 && resume.certifications.some((c) => c.title) && (
                        <div>
                          <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
                            Certifications
                          </h2>
                          <div className="space-y-2">
                            {resume.certifications.map(
                              (cert, idx) =>
                                cert.title && (
                                  <div key={idx} className="flex justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-slate-900">{cert.title}</p>
                                      {cert.issuer && <p className="text-sm text-slate-600">{cert.issuer}</p>}
                                    </div>
                                    {cert.date && <p className="text-sm text-slate-600">{cert.date}</p>}
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Applicant Info & Cover Letter */}
              <div className="lg:col-span-1 p-6 space-y-6 overflow-y-auto">
                {/* Applicant Info Card */}
                {userDetails && (
                  <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide border-b border-slate-300 pb-2">
                      Applicant Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-600 font-medium">Name</p>
                        <p className="text-slate-900 mb-1">{userDetails.fullname}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium flex items-center gap-1">
                          <Mail size={14} /> Email
                        </p>
                        <a href={`mailto:${userDetails.email}`} className="text-blue-900 hover:underline break-all">
                          {userDetails.email}
                        </a>
                      </div>
                      <div>
                        <p className="text-slate-600 font-medium flex items-center gap-1">
                          <Phone size={14} /> Phone
                        </p>
                        <a href={`tel:${userDetails.phonenumber}`} className="text-blue-900 hover:underline">
                          {userDetails.phonenumber}
                        </a>
                      </div>
                      {userDetails.address && (
                        <div>
                          <p className="text-slate-600 font-medium flex items-center gap-1">
                            <MapPin size={14} /> Location
                          </p>
                          <p className="text-slate-900">{userDetails.address}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-slate-600 font-medium">Applied On</p>
                        <p className="text-slate-900">{formatDate(application.appliedDate)}</p>
                      </div>
                      <div className="pt-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(application.status)} bg-white`}>
                          {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cover Letter Card */}
                {application.coverLetter && (
                  <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide border-b border-slate-300 pb-2">
                      Cover Letter
                    </h3>
                    <div className="bg-white p-3 rounded border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {application.coverLetter}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-200 p-6 bg-white flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={updating}
            className="px-4 py-2 text-sm font-medium border border-slate-200 rounded hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>

          {application.status !== 'rejected' && (
            <button
              onClick={handleReject}
              disabled={updating}
              className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              Reject
            </button>
          )}

          {application.status !== 'shortlisted' && application.status !== 'accepted' && (
            <button
              onClick={handleShortlist}
              disabled={updating}
              className="px-4 py-2 text-sm font-medium bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Shortlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewDetails;
