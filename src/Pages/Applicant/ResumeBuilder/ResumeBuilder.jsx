import React, { useState, useEffect } from "react";
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
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
  });

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setResumeData((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            name: user.name || user.fullname || "",
            email: user.email || "",
            phone: user.phone || "",
          },
        }));
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    }

    // Load saved resume data
    const savedResume = localStorage.getItem("resumeData");
    if (savedResume) {
      try {
        setResumeData(JSON.parse(savedResume));
      } catch (error) {
        console.error("Error loading saved resume:", error);
      }
    }
  }, []);

  const handleSave = () => {
    const isComplete =
      resumeData.personalInfo.name &&
      resumeData.personalInfo.email &&
      resumeData.personalInfo.phone &&
      resumeData.education.some((e) => e.degree) &&
      resumeData.skills.length > 0;

    localStorage.setItem("resumeData", JSON.stringify(resumeData));

    if (isComplete) {
      localStorage.setItem("resumeComplete", "true");
      alert("Resume saved successfully!");
    } else {
      alert("Resume saved! Note: Some required fields are still incomplete.");
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
              <p className="text-sm text-slate-500">Review your resume on the right and save when ready</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">Your resume is ready!</p>
              <p className="text-green-700 text-sm mt-1">Check the preview on the right side. Click Save to complete.</p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700 text-white h-12">
                <Save className="w-5 h-5 mr-2" />
                Save Resume
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
                <ResumePreview data={resumeData} />
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
