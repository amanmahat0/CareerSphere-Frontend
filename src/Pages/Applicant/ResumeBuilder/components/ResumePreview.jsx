import React from "react";

const ResumePreview = ({ data }) => {
  const { personalInfo, education, experience, skills, projects, certifications } = data;

  return (
    <div className="bg-white shadow-lg print:shadow-none" id="resume-preview">
      <div className="p-10">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {personalInfo.name || "Your Name"}
          </h1>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.email && personalInfo.phone && <span>•</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.phone && personalInfo.location && <span>•</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
          {(personalInfo.linkedin || personalInfo.website) && (
            <div className="flex flex-wrap gap-2 text-sm text-blue-600 mt-1">
              {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
              {personalInfo.linkedin && personalInfo.website && <span>•</span>}
              {personalInfo.website && <span>{personalInfo.website}</span>}
            </div>
          )}
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
              Professional Summary
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">{personalInfo.summary}</p>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && education.some((e) => e.degree) && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
              Education
            </h2>
            <div className="space-y-3">
              {education.map(
                (edu) =>
                  edu.degree && (
                    <div key={edu.id}>
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
        {experience.length > 0 && experience.some((e) => e.title) && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
              Experience
            </h2>
            <div className="space-y-3">
              {experience.map(
                (exp) =>
                  exp.title && (
                    <div key={exp.id}>
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
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && projects.some((p) => p.name) && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map(
                (project) =>
                  project.name && (
                    <div key={project.id}>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-slate-700 mb-1">{project.description}</p>
                      )}
                      {project.technologies && project.technologies.length > 0 && (
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Technologies:</span> {project.technologies.join(", ")}
                        </p>
                      )}
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && certifications.some((c) => c.name) && (
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide border-b border-slate-300 pb-1">
              Certifications
            </h2>
            <div className="space-y-2">
              {certifications.map(
                (cert) =>
                  cert.name && (
                    <div key={cert.id} className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{cert.name}</p>
                        {cert.issuer && <p className="text-sm text-slate-600">{cert.issuer}</p>}
                      </div>
                      {cert.year && <p className="text-sm text-slate-600">{cert.year}</p>}
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
