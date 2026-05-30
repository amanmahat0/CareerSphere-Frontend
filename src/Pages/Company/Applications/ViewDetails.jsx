import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, MapPin, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../../utils/api';
import { toast } from '../../../utils/toast';

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':     return 'bg-yellow-100 text-yellow-700';
    case 'shortlisted': return 'bg-blue-100 text-blue-700';
    case 'accepted':    return 'bg-green-100 text-green-700';
    case 'rejected':    return 'bg-red-100 text-red-700';
    case 'withdrawn':   return 'bg-orange-100 text-orange-700';
    default:            return 'bg-slate-100 text-slate-700';
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

const ViewDetails = ({ application, isOpen, onClose, onStatusUpdate }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [resume, setResume]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [updating, setUpdating]       = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    if (isOpen && application) {
      setLoading(true);
      setError('');
      if (application.userId) setUserDetails(application.userId);
      // Prefer the snapshot taken at submission time; fall back to populated resumeId for old applications
      setResume(application.resumeSnapshot || application.resumeId || null);
      setLoading(false);
    }
  }, [isOpen, application]);

  const handleShortlist = async () => {
    try {
      setUpdating(true);
      setError('');
      const response = await api.shortlistApplication(application._id);
      if (response.success) {
        if (onStatusUpdate) onStatusUpdate(application._id, 'shortlisted');
        toast.success('Application shortlisted! Candidate will appear in Interview Management.');
        onClose();
      }
    } catch (err) {
      setError('Failed to shortlist applicant');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this application?')) return;
    try {
      setUpdating(true);
      setError('');
      const response = await api.rejectApplication(application._id);
      if (response.success) {
        if (onStatusUpdate) onStatusUpdate(application._id, 'rejected');
        toast.success('Application rejected.');
        onClose();
      }
    } catch (err) {
      setError('Failed to reject applicant');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Application Details</h2>
            {application.jobId && (
              <p className="text-xs text-slate-500 mt-0.5">
                Position: <span className="font-semibold text-slate-700">{application.jobId.title}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} disabled={updating} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">

          {/* Withdrawal banner */}
          {application.status === 'withdrawn' && (
            <div className="m-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-900 font-semibold text-sm">Application Withdrawn</p>
                <p className="text-orange-800 text-xs mt-1">
                  {userDetails?.fullname || 'The applicant'} has withdrawn this application.
                </p>
                {application.withdrawnAt && (
                  <p className="text-orange-700 text-xs mt-1">
                    Withdrawn on {new Date(application.withdrawnAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                )}
                {application.withdrawalReason && (
                  <p className="text-orange-800 text-xs mt-1">
                    <span className="font-medium">Reason:</span> {application.withdrawalReason}
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-blue-900" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3">

              {/* Resume preview */}
              <div className="lg:col-span-2 border-r border-slate-100 overflow-y-auto max-h-[65vh]">
                {resume ? (
                  <div className="p-8">
                    <div className="border-b-2 border-slate-900 pb-4 mb-6">
                      <h1 className="text-2xl font-bold text-slate-900 mb-1">
                        {resume.personalInfo?.name || 'Name'}
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

                    {resume.personalInfo?.summary && (
                      <Section title="Professional Summary">
                        <p className="text-sm text-slate-700 leading-relaxed">{resume.personalInfo.summary}</p>
                      </Section>
                    )}

                    {resume.education?.some(e => e.degree) && (
                      <Section title="Education">
                        <div className="space-y-3">
                          {resume.education.map((edu, i) => edu.degree && (
                            <div key={i}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-sm font-semibold text-slate-900">{edu.degree}</h3>
                                  {edu.institution && <p className="text-sm text-slate-600">{edu.institution}</p>}
                                </div>
                                <div className="text-right">
                                  {edu.year && <p className="text-sm text-slate-900">{edu.year}</p>}
                                  {edu.cgpa && <p className="text-xs text-slate-500">CGPA: {edu.cgpa}</p>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {resume.experience?.some(e => e.title) && (
                      <Section title="Experience">
                        <div className="space-y-3">
                          {resume.experience.map((exp, i) => exp.title && (
                            <div key={i}>
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h3 className="text-sm font-semibold text-slate-900">{exp.title}</h3>
                                  {exp.company && <p className="text-sm text-slate-600">{exp.company}</p>}
                                </div>
                                {exp.duration && <p className="text-sm text-slate-500">{exp.duration}</p>}
                              </div>
                              {exp.description && <p className="text-sm text-slate-700 leading-relaxed">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {resume.skills?.length > 0 && (
                      <Section title="Skills">
                        <div className="flex flex-wrap gap-2">
                          {resume.skills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                              {skill.skillName || skill}
                            </span>
                          ))}
                        </div>
                      </Section>
                    )}

                    {resume.projects?.some(p => p.title) && (
                      <Section title="Projects">
                        <div className="space-y-3">
                          {resume.projects.map((p, i) => p.title && (
                            <div key={i}>
                              <h3 className="text-sm font-semibold text-slate-900 mb-1">{p.title}</h3>
                              {p.description && <p className="text-sm text-slate-700 mb-1">{p.description}</p>}
                              {p.link && <p className="text-xs text-slate-500"><span className="font-medium">Link:</span> {p.link}</p>}
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}

                    {resume.certifications?.some(c => c.title) && (
                      <Section title="Certifications">
                        <div className="space-y-2">
                          {resume.certifications.map((cert, i) => cert.title && (
                            <div key={i} className="flex justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{cert.title}</p>
                                {cert.issuer && <p className="text-xs text-slate-500">{cert.issuer}</p>}
                              </div>
                              {cert.date && <p className="text-xs text-slate-500">{cert.date}</p>}
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full py-16 text-slate-400 text-sm">
                    No resume attached to this application.
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="p-6 space-y-5 overflow-y-auto">
                {userDetails && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                      Applicant Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Name</p>
                        <p className="text-slate-900 font-semibold">{userDetails.fullname}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><Mail size={12} /> Email</p>
                        <a href={`mailto:${userDetails.email}`} className="text-blue-700 hover:underline text-xs break-all">
                          {userDetails.email}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><Phone size={12} /> Phone</p>
                        <a href={`tel:${userDetails.phonenumber}`} className="text-blue-700 hover:underline text-xs">
                          {userDetails.phonenumber}
                        </a>
                      </div>
                      {userDetails.address && (
                        <div>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><MapPin size={12} /> Location</p>
                          <p className="text-slate-900 text-xs">{userDetails.address}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Applied On</p>
                        <p className="text-slate-900 text-xs">{formatDate(application.appliedDate)}</p>
                      </div>
                      <div className="pt-1">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${getStatusBadgeClass(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {application.coverLetter && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                      Cover Letter
                    </h3>
                    <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto">
                      {application.coverLetter}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex gap-3 justify-end bg-white">
          <button
            onClick={onClose}
            disabled={updating}
            className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Close
          </button>

          {application.status !== 'withdrawn' && (
            <>
              {application.status !== 'rejected' && (
                <button
                  onClick={handleReject}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Reject
                </button>
              )}

              {application.status !== 'shortlisted' && application.status !== 'accepted' && (
                <button
                  onClick={handleShortlist}
                  disabled={updating}
                  className="px-4 py-2 text-sm font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-950 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Shortlist
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-200 pb-1">{title}</h2>
    {children}
  </div>
);

export default ViewDetails;
