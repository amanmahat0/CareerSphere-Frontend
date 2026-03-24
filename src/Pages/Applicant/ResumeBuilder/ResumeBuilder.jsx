import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../ui/button";
import {
  ArrowLeft,
  Download,
  Save,
  User,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  FileText,
  Check,
  Eye,
} from "lucide-react";
import Sidebar from "../Components/Applicant Sidebar";
import DashboardHeader from "../../../Components/DashboardHeader";
import { api } from "../../../utils/api";

// Import section components
import PersonalInfoSection from "./components/PersonalInfoSection";
import EducationSection from "./components/EducationSection";
import ExperienceSection from "./components/ExperienceSection";
import SkillsSection from "./components/SkillsSection";
import ProjectsSection from "./components/ProjectsSection";
import CertificationsSection from "./components/CertificationsSection";
import ResumePreview from "./components/ResumePreview";

const STEPS = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Education", icon: GraduationCap },
  { id: 3, name: "Experience", icon: Briefcase },
  { id: 4, name: "Skills", icon: Code },
  { id: 5, name: "Projects", icon: FileText },
  { id: 6, name: "Certifications", icon: Award },
  { id: 7, name: "Preview", icon: Eye },
];

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
      summary: "",
    },
    education: [
      {
        id: 1,
        degree: "",
        institution: "",
        year: "",
        cgpa: "",
      },
    ],
    experience: [
      {
        id: 1,
        company: "",
        title: "",
        duration: "",
        description: "",
      },
    ],
    skills: [],
    projects: [],
    certifications: [],
  });

  // Load user data and resume from database
  useEffect(() => {
    const loadResumeData = async () => {
      try {
        // First, load user profile data
        const storedUser = localStorage.getItem("user");
        let userEmail = "";
        let userPhone = "";
        let userName = "";

        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            userName = user.fullname || user.name || "";
            userEmail = user.email || "";
            userPhone = user.phonenumber || user.phone || "";
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }

        // Try to load resume from database
        try {
          const response = await api.getResume();
          if (response.success && response.data) {
            // Merge database resume with user profile data
            setResumeData({
              personalInfo: {
                name: response.data.personalInfo?.name || userName,
                email: response.data.personalInfo?.email || userEmail,
                phone: response.data.personalInfo?.phone || userPhone,
                location: response.data.personalInfo?.location || "",
                linkedin: response.data.personalInfo?.linkedin || "",
                website: response.data.personalInfo?.website || "",
                summary: response.data.personalInfo?.summary || "",
              },
              education: (response.data.education && response.data.education.length > 0) 
                ? response.data.education.map((edu) => ({
                    ...edu,
                    id: edu._id || edu.id || Date.now(),
                  }))
                : [{ id: Date.now(), degree: "", institution: "", year: "", cgpa: "" }],
              experience: (response.data.experience && response.data.experience.length > 0) 
                ? response.data.experience.map((exp) => ({
                    ...exp,
                    id: exp._id || exp.id || Date.now(),
                    title: exp.title || exp.position || "", // Map old 'position' to 'title'
                  }))
                : [{ id: Date.now(), company: "", title: "", duration: "", description: "" }],
              skills: response.data.skills || [],
              projects: response.data.projects || [],
              certifications: response.data.certifications || [],
            });
          } else {
            // No resume in database, use profile data
            setResumeData((prev) => ({
              ...prev,
              personalInfo: {
                ...prev.personalInfo,
                name: userName,
                email: userEmail,
                phone: userPhone,
              },
            }));
          }
        } catch (error) {
          console.error("Could not load resume from database:", error);
          // Initialize with user profile data only
          setResumeData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              name: userName,
              email: userEmail,
              phone: userPhone,
            },
          }));
        }
      } catch (error) {
        console.error("Error in loadResumeData:", error);
      }
    };

    loadResumeData();
  }, []);

  const handleSave = async () => {
    // Validation
    const isComplete =
      resumeData.personalInfo.name &&
      resumeData.personalInfo.email &&
      resumeData.personalInfo.phone &&
      resumeData.education.some((e) => e.degree && e.institution) &&
      resumeData.experience.some((e) => e.title && e.company) &&
      resumeData.skills.length > 0;

    // Prepare data for saving - include all components even if empty
    const dataToSave = {
      personalInfo: {
        name: resumeData.personalInfo.name || "",
        email: resumeData.personalInfo.email || "",
        phone: resumeData.personalInfo.phone || "",
        location: resumeData.personalInfo.location || "",
        linkedin: resumeData.personalInfo.linkedin || "",
        website: resumeData.personalInfo.website || "",
        summary: resumeData.personalInfo.summary || "",
      },
      education: resumeData.education.map(e => ({
        ...e,
        degree: e.degree || "",
        institution: e.institution || "",
        year: e.year || "",
        cgpa: e.cgpa || "",
      })),
      experience: resumeData.experience.map(e => ({
        ...e,
        company: e.company || "",
        title: e.title || "",
        duration: e.duration || "",
        description: e.description || "",
      })),
      skills: resumeData.skills.filter(s => s && s.trim()),
      projects: resumeData.projects.map(p => ({
        ...p,
        name: p.name || "",
        description: p.description || "",
        link: p.link || "",
      })),
      certifications: resumeData.certifications.map(c => ({
        ...c,
        name: c.name || "",
        issuer: c.issuer || "",
        year: c.year || "",
        credentialId: c.credentialId || "",
      })),
      isComplete: isComplete,
    };

    try {
      const response = await api.saveResume(dataToSave);

      if (response.success) {
        if (isComplete) {
          localStorage.setItem("resumeComplete", "true");
          alert("✓ Resume saved successfully!\n\nAll sections have been saved to the database.");
        } else {
          alert("✓ Resume saved!\n\nNote: Some required fields are still incomplete:\n- Personal Info (name, email, phone)\n- At least one Education entry\n- At least one Experience entry\n- At least one Skill\n\nPlease complete these to finalize your resume.");
        }
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      alert("✗ Error saving resume:\n" + (error.message || "Please check your connection and try again."));
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= 7) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setCurrentStep(7);
  };

  // Memoize resume data to prevent unnecessary re-renders of preview
  const memoizedResumeData = useMemo(() => resumeData, [resumeData]);

  const renderCurrentSection = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoSection
            data={resumeData.personalInfo}
            onChange={(data) => setResumeData({ ...resumeData, personalInfo: data })}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <EducationSection
            data={resumeData.education}
            onChange={(data) => setResumeData({ ...resumeData, education: data })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <ExperienceSection
            data={resumeData.experience}
            onChange={(data) => setResumeData({ ...resumeData, experience: data })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <SkillsSection
            data={resumeData.skills}
            onChange={(data) => setResumeData({ ...resumeData, skills: data })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <ProjectsSection
            data={resumeData.projects}
            onChange={(data) => setResumeData({ ...resumeData, projects: data })}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 6:
        return (
          <CertificationsSection
            data={resumeData.certifications}
            onChange={(data) => setResumeData({ ...resumeData, certifications: data })}
            onBack={prevStep}
            onFinish={handleFinish}
          />
        );
      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Review & Save</h3>
              <p className="text-sm text-slate-500">Review your complete resume on the right and save when ready</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className={`flex items-start gap-3 p-3 rounded-lg ${resumeData.personalInfo.name && resumeData.personalInfo.email && resumeData.personalInfo.phone ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <span className={resumeData.personalInfo.name && resumeData.personalInfo.email && resumeData.personalInfo.phone ? 'text-green-600' : 'text-yellow-600'}>✓</span>
                <span className={resumeData.personalInfo.name && resumeData.personalInfo.email && resumeData.personalInfo.phone ? 'text-green-700' : 'text-yellow-700'}>Personal Information: {resumeData.personalInfo.name ? 'Complete' : 'Incomplete'}</span>
              </div>
              
              <div className={`flex items-start gap-3 p-3 rounded-lg ${resumeData.education.filter(e => e.degree && e.institution).length > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <span className={resumeData.education.filter(e => e.degree && e.institution).length > 0 ? 'text-green-600' : 'text-yellow-600'}>✓</span>
                <span className={resumeData.education.filter(e => e.degree && e.institution).length > 0 ? 'text-green-700' : 'text-yellow-700'}>Education: {resumeData.education.filter(e => e.degree && e.institution).length} entry(ies)</span>
              </div>
              
              <div className={`flex items-start gap-3 p-3 rounded-lg ${resumeData.experience.filter(e => e.company && e.title).length > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <span className={resumeData.experience.filter(e => e.company && e.title).length > 0 ? 'text-green-600' : 'text-yellow-600'}>✓</span>
                <span className={resumeData.experience.filter(e => e.company && e.title).length > 0 ? 'text-green-700' : 'text-yellow-700'}>Experience: {resumeData.experience.filter(e => e.company && e.title).length} entry(ies)</span>
              </div>
              
              <div className={`flex items-start gap-3 p-3 rounded-lg ${resumeData.skills.filter(s => s && s.trim()).length > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <span className={resumeData.skills.filter(s => s && s.trim()).length > 0 ? 'text-green-600' : 'text-yellow-600'}>✓</span>
                <span className={resumeData.skills.filter(s => s && s.trim()).length > 0 ? 'text-green-700' : 'text-yellow-700'}>Skills: {resumeData.skills.filter(s => s && s.trim()).length} skill(s)</span>
              </div>
              
              <div className={`flex items-start gap-3 p-3 rounded-lg ${resumeData.projects.filter(p => p.name && p.name.trim()).length > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'}`}>
                <span className={resumeData.projects.filter(p => p.name && p.name.trim()).length > 0 ? 'text-blue-600' : 'text-slate-400'}>•</span>
                <span className={resumeData.projects.filter(p => p.name && p.name.trim()).length > 0 ? 'text-blue-700' : 'text-slate-600'}>Projects: {resumeData.projects.filter(p => p.name && p.name.trim()).length} entry(ies) (optional)</span>
              </div>
              
              <div className={`flex items-start gap-3 p-3 rounded-lg ${resumeData.certifications.filter(c => c.name && c.name.trim()).length > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'}`}>
                <span className={resumeData.certifications.filter(c => c.name && c.name.trim()).length > 0 ? 'text-blue-600' : 'text-slate-400'}>•</span>
                <span className={resumeData.certifications.filter(c => c.name && c.name.trim()).length > 0 ? 'text-blue-700' : 'text-slate-600'}>Certifications: {resumeData.certifications.filter(c => c.name && c.name.trim()).length} entry(ies) (optional)</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700 text-white h-12">
                <Save className="w-5 h-5 mr-2" />
                Save to Database
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF} className="w-full h-12">
                <Download className="w-5 h-5 mr-2" />
                Download as PDF
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="w-full h-12">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Edit Resume
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      {/* Dashboard Header */}
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(true)}
        userRole="Applicant"
        dashboardPath="/applicant/dashboard"
        profilePath="/applicant/profile"
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage="resume" />

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Sub Header with Actions */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">Resume Builder</h1>
                  <p className="text-sm text-slate-500">
                    Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleSave} className="h-10">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Step Progress */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => goToStep(step.id)}
                      className={`flex flex-col items-center gap-1 transition-all ${
                        isCurrent
                          ? "text-blue-600"
                          : isCompleted
                          ? "text-green-600"
                          : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCurrent
                            ? "border-blue-600 bg-blue-50"
                            : isCompleted
                            ? "border-green-600 bg-green-50"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs font-medium hidden sm:block">{step.name}</span>
                    </button>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded ${
                          currentStep > step.id ? "bg-green-500" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Side - Form */}
            <div className="w-1/2 overflow-y-auto p-6 bg-white border-r border-slate-200">
              <div className="max-w-2xl mx-auto">{renderCurrentSection()}</div>
            </div>

            {/* Right Side - Live Preview (always visible) */}
            <div className="w-1/2 overflow-y-auto p-6 bg-slate-100 print:w-full print:p-0">
              <div className="max-w-3xl mx-auto">
                <div className="mb-4 print:hidden">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Live Preview</h2>
                  <p className="text-sm text-slate-500">Your resume updates in real-time</p>
                </div>
                <ResumePreview data={memoizedResumeData} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;
