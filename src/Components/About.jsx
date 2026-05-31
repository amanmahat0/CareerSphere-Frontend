import {
  Target, TrendingUp, Building2, GraduationCap, Briefcase,
  CheckCircle, Globe, Code, Heart, Users, Layers, Bell,
} from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import Footer from "./Footer";

const features = [
  {
    icon: Code,
    title: "Smart Job Matching",
    description:
      "AI-powered chatbot and skill-based filtering help applicants discover the most relevant jobs and internships in seconds.",
  },
  {
    icon: Layers,
    title: "End-to-End Hiring Pipeline",
    description:
      "Manage the full recruitment flow — shortlisting, test assignment, interview scheduling, offer letters, and onboarding — all in one place.",
  },
  {
    icon: CheckCircle,
    title: "Verified Companies Only",
    description:
      "Every company is document-verified by our admin team before they can post jobs or contact applicants, ensuring a safe and trustworthy environment.",
  },
  {
    icon: GraduationCap,
    title: "Free for Students",
    description:
      "Students and fresh graduates access CareerSphere at zero cost. Build your resume, track applications, and manage interview schedules from one dashboard.",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description:
      "Get instant in-app and email notifications for every pipeline update — from shortlisting to job offers — powered by Socket.IO.",
  },
  {
    icon: Globe,
    title: "Resume Builder",
    description:
      "Create a professional resume step-by-step with our guided builder. Download as PDF or attach directly to any job application on the platform.",
  },
];

const mission = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To bridge the gap between Nepal's growing IT industry and talented students by providing a transparent, end-to-end career placement platform — from first application to confirmed hire.",
  },
  {
    icon: TrendingUp,
    title: "Our Vision",
    description:
      "To become Nepal's most trusted career platform, where every student has equal access to quality opportunities and every company can hire efficiently with full visibility into the process.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Sign up as a student or company. Build your resume or set up your company profile with verified documents.",
  },
  {
    step: "02",
    title: "Browse & Apply",
    description: "Students explore curated jobs and internships. Apply with your built-in resume and a personalised cover letter.",
  },
  {
    step: "03",
    title: "Move Through the Pipeline",
    description: "Companies shortlist, assign tests, schedule interviews, and send offer letters — all inside CareerSphere.",
  },
  {
    step: "04",
    title: "Get Hired",
    description: "Accept your offer, receive your confirmation, and start your career journey with full documentation.",
  },
];

const nepalStats = [
  { number: "60,000+", label: "IT Professionals in Nepal", note: "Growing at ~20% annually" },
  { number: "500+",    label: "Registered IT Companies",   note: "Concentrated in Kathmandu Valley" },
  { number: "NPR 50B+",label: "IT Export Revenue (2023)",  note: "Nepal's fastest-growing export sector" },
];

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ── Hero ── */}
      <section className="bg-linear-to-br from-blue-900 via-blue-700 to-blue-500 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            Built for Nepal's Workforce
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Connecting Nepal's Talent<br className="hidden sm:block" />
            with the Right Opportunities
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            CareerSphere is an integrated job and internship placement platform built specifically for
            Nepali students, fresh graduates, and the companies hiring them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50 font-semibold"
              onClick={() => navigate("/applicant/signup")}
            >
              Find a Job
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-semibold"
              onClick={() => navigate("/company/signup")}
            >
              Post a Job
            </Button>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What Drives Us</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every feature we build serves one goal — making career placement fair, transparent, and fast.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {mission.map((item, i) => (
              <div key={i} className="p-8 rounded-2xl border border-slate-200 hover:shadow-md transition-shadow bg-white">
                <div className="bg-blue-900 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Features ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything in One Platform</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              CareerSphere is not just a job board — it's a complete hiring ecosystem for both students and companies.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From signup to job offer in four simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={i} className="relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] right-0 h-0.5 bg-blue-100 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-900 text-white flex items-center justify-center text-lg font-extrabold mb-4 shadow-md">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{step.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nepal IT Ecosystem ── */}
      <section className="py-20 bg-linear-to-br from-blue-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nepal's Growing IT Sector</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Nepal's technology industry is one of the fastest-growing sectors in the country,
              creating thousands of opportunities each year for skilled professionals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {nepalStats.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-3xl font-extrabold text-blue-900 mb-2">{s.number}</div>
                <p className="text-gray-800 font-semibold mb-1">{s.label}</p>
                <p className="text-gray-400 text-xs">{s.note}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Sources: Ministry of Finance Nepal, NITDB, ICAN Annual Report 2023
          </p>
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Who Is CareerSphere For?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Students & Graduates</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  "Browse hundreds of jobs and internships",
                  "Build a professional resume with our guided builder",
                  "Track every application and interview in real time",
                  "Receive notifications for every pipeline update",
                  "Accept or negotiate job offers directly on the platform",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 bg-blue-900 hover:bg-blue-950 text-white"
                onClick={() => navigate("/applicant/signup")}
              >
                Join as a Student
              </Button>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Companies & Institutions</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  "Post jobs and internships to a verified applicant pool",
                  "Manage all applications with filters, search, and status tracking",
                  "Run a structured interview pipeline with built-in tools",
                  "Send test assignments, schedule interviews, and issue offer letters",
                  "Issue certificates to hired candidates directly from the platform",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 bg-slate-800 hover:bg-slate-900 text-white"
                onClick={() => navigate("/company/signup")}
              >
                Join as a Company
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Project Context ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <GraduationCap size={13} /> Final Year Project
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Project</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            CareerSphere was developed as a Final Year Project by students of the Bachelor of Computer
            Applications programme at <strong>Patan Multiple Campus, Tribhuvan University</strong>.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            The platform is a production-ready MERN stack application featuring real-time notifications
            (Socket.IO), an AI-powered chatbot, a full five-stage interview pipeline, integrated resume
            builder, Brevo transactional emails, and document-based company verification with admin controls.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-linear-to-br from-blue-900 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Career Journey Today
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Whether you're a student looking for your first opportunity or a company building a great team —
            CareerSphere is built for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50 font-semibold"
              onClick={() => navigate("/applicant/signup")}
            >
              I'm a Job Seeker
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-semibold"
              onClick={() => navigate("/company/signup")}
            >
              I'm a Company
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
