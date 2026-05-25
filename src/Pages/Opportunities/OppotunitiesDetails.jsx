import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../Components/Header";
import Footer from "../../Components/Footer";
import { Button } from "../../ui/button";
import { Alert, AlertDescription } from "../../ui/alert";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  AlertCircle,
  Building2,
  Loader2,
  Calendar,
  DollarSign,
  Users,
  Share2,
  Bookmark,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
} from "lucide-react";
import { api } from "../../utils/api";

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const resolveLogoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/uploads")) return `${BACKEND_URL}${url}`;
  return url;
};
import { toast } from "../../utils/toast";
import ApplyModal from "./ApplyNow";

const typeBadge = (type) => {
  if (!type) return "bg-gray-100 text-gray-600 border-gray-200";
  const t = type.toLowerCase();
  if (t === "internship") return "bg-green-50 text-green-700 border-green-200";
  if (t === "traineeship") return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
};

const Section = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6">
    <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

const BulletList = ({ items }) => (
  <ul className="space-y-2">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        {item}
      </li>
    ))}
  </ul>
);

const CompanyInfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <span className="text-gray-400 shrink-0 mt-0.5">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 wrap-break-word">{value}</p>
    </div>
  </div>
);

const OpportunityDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [resumeCompleted, setResumeCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const loadUserAndResumeStatus = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          try {
            const resumeResponse = await api.getResume();
            const isComplete = resumeResponse.success && resumeResponse.data?.isComplete;
            setResumeCompleted(isComplete);
            localStorage.setItem("resumeComplete", JSON.stringify(isComplete));
          } catch {
            const stored = localStorage.getItem("resumeComplete");
            setResumeCompleted(stored ? JSON.parse(stored) : false);
          }
        } catch {
          // ignore
        }
      }
    };
    loadUserAndResumeStatus();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('savedJobs');
    if (stored) {
      try {
        const jobs = JSON.parse(stored);
        setIsBookmarked(jobs.some((j) => j.id === id));
      } catch {}
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getJobById(id);
        if (response.success && response.job) {
          setJob(response.job);
        } else if (response._id || response.id) {
          setJob(response);
        } else {
          setError("Failed to load job details.");
        }
      } catch {
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  const handleApply = () => {
    if (!user) { navigate("/applicant/login"); return; }
    if (!resumeCompleted) {
      toast.warning("Please complete your resume before applying.");
      navigate("/applicant/resume");
      return;
    }
    setShowApplyModal(true);
  };

  const handleBookmark = () => {
    let savedJobs = [];
    try {
      const stored = localStorage.getItem('savedJobs');
      savedJobs = stored ? JSON.parse(stored) : [];
    } catch {}

    if (isBookmarked) {
      savedJobs = savedJobs.filter((j) => j.id !== id);
      toast.success('Removed from saved jobs');
    } else {
      savedJobs.push({
        id,
        title: job.title,
        company: job.company,
        type: job.type,
        location: job.location,
        deadline: job.deadline,
        logo: job.companyLogo || job.logo || null,
        savedAt: new Date().toISOString(),
      });
      toast.success('Job saved!');
    }
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: job.title, text: `${job.title} at ${job.company}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          <span className="ml-3 text-sm text-gray-500">Loading opportunity…</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Could not load this opportunity</h2>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Button onClick={() => navigate("/opportunities")}>Back to Opportunities</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* ── Breadcrumb / Back ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to opportunities
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Resume warning */}
        {user && !resumeCompleted && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-900">
              <strong>Complete your resume first.</strong>{" "}
              <button onClick={() => navigate("/applicant/resume")} className="underline hover:text-amber-700 font-medium">
                Build it now →
              </button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-14 h-14 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                  {resolveLogoUrl(job.companyLogo || job.logo) ? (
                    <img
                      src={resolveLogoUrl(job.companyLogo || job.logo)}
                      alt={job.company}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${typeBadge(job.type)}`}>
                      {job.type}
                    </span>
                  </div>
                  <p className="text-base text-gray-600 mb-3">{job.company}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500">
                    {job.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" /> {job.location}
                      </span>
                    )}
                    {job.duration && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" /> {job.duration}
                      </span>
                    )}
                    {job.salary && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-gray-400" /> {job.salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <Section title="About This Opportunity">
              <p className="text-sm text-gray-700 leading-relaxed">{job.description}</p>
            </Section>

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <Section title="Requirements">
                <BulletList items={job.requirements} />
              </Section>
            )}

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <Section title="Responsibilities">
                <BulletList items={job.responsibilities} />
              </Section>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
              <Section title="Benefits">
                <BulletList items={job.benefits} />
              </Section>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <Section title="Required Skills">
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="text-sm bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Apply card — sticky */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-6">
              <Button
                onClick={handleApply}
                disabled={user && !resumeCompleted}
                className="w-full h-11 text-base font-semibold mb-3"
              >
                Apply Now
              </Button>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleBookmark}
                  className={`flex-1 flex items-center justify-center gap-2 h-9 text-sm rounded-lg border transition-colors font-medium
                    ${isBookmarked
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                  {isBookmarked ? "Saved" : "Save"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 h-9 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {!user && (
                <p className="text-xs text-gray-500 text-center">
                  <button onClick={() => navigate("/applicant/login")} className="text-blue-600 hover:underline font-medium">
                    Login
                  </button>{" "}
                  to apply for this opportunity
                </p>
              )}
            </div>

            {/* Job Details */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Job Details</h2>
              <dl className="space-y-3">
                {[
                  { Icon: Calendar, label: "Posted", value: job.postedDate || "Recently" },
                  { Icon: Calendar, label: "Deadline", value: job.deadline || "Open" },
                  { Icon: Users,    label: "Applicants", value: job.applicants ?? 0 },
                  { Icon: Briefcase, label: "Type", value: job.type },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-sm text-gray-500">
                      <Icon className="w-4 h-4 text-gray-400" /> {label}
                    </dt>
                    <dd className="text-sm font-medium text-gray-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Company Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  {resolveLogoUrl(job.companyLogo || job.logo) ? (
                    <img src={resolveLogoUrl(job.companyLogo || job.logo)} alt={job.company} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{job.company}</p>
                  {job.companyInfo?.industry && (
                    <p className="text-xs text-gray-500 mt-0.5">{job.companyInfo.industry}</p>
                  )}
                </div>
              </div>

              {/* About */}
              {job.companyInfo?.about && (
                <p className="text-sm text-gray-600 leading-relaxed mb-5">{job.companyInfo.about}</p>
              )}

              {/* Company details */}
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Company Information</h3>
              <dl className="space-y-2.5 mb-5">
                {job.companyInfo?.industry && (
                  <CompanyInfoRow icon={<Briefcase className="w-3.5 h-3.5" />} label="Industry" value={job.companyInfo.industry} />
                )}
                {job.companyInfo?.companySize && (
                  <CompanyInfoRow icon={<Users className="w-3.5 h-3.5" />} label="Company Size" value={`${job.companyInfo.companySize} employees`} />
                )}
                {(job.companyInfo?.address || job.location) && (
                  <CompanyInfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={job.companyInfo?.address || job.location} />
                )}
              </dl>

              {/* Contact */}
              {(job.companyInfo?.email || job.companyInfo?.phone || job.companyInfo?.address) && (
                <>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contact Information</h3>
                  <dl className="space-y-2.5 mb-5">
                    {job.companyInfo?.email && (
                      <CompanyInfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={job.companyInfo.email} />
                    )}
                    {job.companyInfo?.phone && (
                      <CompanyInfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={job.companyInfo.phone} />
                    )}
                    {job.companyInfo?.address && (
                      <CompanyInfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={job.companyInfo.address} />
                    )}
                  </dl>
                </>
              )}

              {/* Social / Visit */}
              <div className="space-y-2">
                {job.companyInfo?.website && (
                  <a href={job.companyInfo.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-9 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                    <Globe className="w-4 h-4" /> Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showApplyModal && job && (
        <ApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => setShowApplyModal(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default OpportunityDetails;
