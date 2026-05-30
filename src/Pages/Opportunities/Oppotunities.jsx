import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "../../Components/Header";
import Footer from "../../Components/Footer";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Alert, AlertDescription } from "../../ui/alert";
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  Clock,
  AlertCircle,
  Building2,
  BadgeCheck,
  Loader2,
  ArrowRight,
  DollarSign,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const resolveLogoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/uploads")) return `${BACKEND_URL}${url}`;
  return url;
};
import { api } from "../../utils/api";
import { toast } from "../../utils/toast";
import ApplyModal from "./ApplyNow";


const typeBadge = (type) => {
  if (!type) return "bg-gray-100 text-gray-600 border-gray-200";
  const t = type.toLowerCase();
  if (t === "internship") return "bg-green-50 text-green-700 border-green-200";
  if (t === "traineeship") return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
};

const pathToType = (path) => {
  if (path === "/jobs") return "Job";
  if (path === "/internships") return "Internship";
  return "all";
};

const Opportunities = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState(() => pathToType(location.pathname));
  const [filterLocation, setFilterLocation] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [resumeCompleted, setResumeCompleted] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    setFilterType(pathToType(location.pathname));
  }, [location.pathname]);

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
          // ignore parse errors
        }
      }
    };
    loadUserAndResumeStatus();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getAllJobs();
        if (response.success && response.jobs) {
          setJobs(response.jobs);
        } else if (Array.isArray(response)) {
          setJobs(response);
        } else {
          setError("Failed to load opportunities.");
        }
      } catch {
        setError("Failed to load opportunities.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const locationOptions = [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort();

  const filteredOpportunities = jobs.filter((opp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      opp.title?.toLowerCase().includes(q) ||
      opp.company?.toLowerCase().includes(q) ||
      opp.skills?.some((s) => s.toLowerCase().includes(q));
    const matchesType = filterType === "all" || opp.type === filterType;
    const matchesLocation = filterLocation === "all" || opp.location === filterLocation;
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleApply = (opportunity) => {
    if (!user) { navigate("/applicant/login"); return; }
    if (!resumeCompleted) {
      toast.warning("Please complete your resume before applying.");
      navigate("/applicant/resume");
      return;
    }
    setSelectedJob(opportunity);
    setShowApplyModal(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
  };

  const handleViewDetails = (opportunity) => {
    navigate(`/opportunities/${opportunity._id || opportunity.id}`);
  };

  const pageTitle =
    filterType === "Job" ? "Jobs" :
    filterType === "Internship" ? "Internships" :
    "All Opportunities";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* ── Page Hero / Search ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{pageTitle}</h1>
          <p className="text-sm text-gray-500 mb-6">
            {loading ? "Loading…" : `${filteredOpportunities.length} opportunit${filteredOpportunities.length === 1 ? "y" : "ies"} found`}
          </p>

          {/* Search row */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search — dominant */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by title, company, or skill…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Type filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-11 w-44 pl-9 pr-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition"
              >
                <option value="all">All Types</option>
                <option value="Job">Jobs</option>
                <option value="Internship">Internships</option>
              </select>
            </div>

            {/* Location filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="h-11 w-44 pl-9 pr-4 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition"
              >
                <option value="all">All Locations</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">

        {/* Banners */}
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
        {!user && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>Login to apply.</strong>{" "}
              <button onClick={() => navigate("/applicant/login")} className="underline hover:text-blue-700 font-medium">
                Login now →
              </button>
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-900">{error}</AlertDescription>
          </Alert>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-500 text-sm">Loading opportunities…</span>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No opportunities found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp._id || opp.id}
                opp={opp}
                user={user}
                resumeCompleted={resumeCompleted}
                onApply={handleApply}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>

      {showApplyModal && selectedJob && (
        <ApplyModal
          job={selectedJob}
          onClose={() => { setShowApplyModal(false); setSelectedJob(null); }}
          onSuccess={handleApplicationSuccess}
        />
      )}

      <Footer />
    </div>
  );
};

const OpportunityCard = ({ opp, user, resumeCompleted, onApply, onViewDetails }) => (
  <div className="group bg-white border border-gray-200 rounded-2xl p-5 flex flex-col hover:border-blue-300 hover:shadow-lg transition-all duration-200">
    {/* Top row */}
    <div className="flex items-start gap-3 mb-4">
      <div className="shrink-0 w-11 h-11 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center group-hover:border-blue-200 transition-colors">
        {resolveLogoUrl(opp.companyLogo || opp.logo) ? (
          <img
            src={resolveLogoUrl(opp.companyLogo || opp.logo)}
            alt={opp.company}
            className="w-full h-full object-cover"
          />
        ) : (
          <Building2 className="w-5 h-5 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-base leading-snug truncate group-hover:text-blue-700 transition-colors">
          {opp.title}
        </h3>
        <p className="text-sm text-gray-500 truncate mt-0.5 flex items-center gap-1">
          {opp.company}
          {opp.companyIsVerified && (
            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" title="Verified Company" />
          )}
        </p>
      </div>
      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${typeBadge(opp.type)}`}>
        {opp.type}
      </span>
    </div>

    {/* Meta */}
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-4">
      {opp.location && (
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {opp.location}
        </span>
      )}
      {opp.duration && (
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {opp.duration}
        </span>
      )}
      {opp.salary && (
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" /> {opp.salary}
        </span>
      )}
    </div>

    {/* Description */}
    {opp.description && (
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
        {opp.description}
      </p>
    )}

    {/* Skills */}
    {opp.skills && opp.skills.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mb-4">
        {opp.skills.slice(0, 3).map((skill, i) => (
          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full border border-gray-200">
            {skill}
          </span>
        ))}
        {opp.skills.length > 3 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full border border-gray-200">
            +{opp.skills.length - 3}
          </span>
        )}
      </div>
    )}

    {/* Deadline */}
    {opp.deadline && (
      <p className="text-xs text-gray-400 mb-4">Deadline: {opp.deadline}</p>
    )}

    {/* Spacer */}
    <div className="flex-1" />

    {/* Actions */}
    <div className="flex gap-2 pt-4 border-t border-gray-100">
      <Button
        onClick={() => onApply(opp)}
        disabled={user && !resumeCompleted}
        className="flex-1 h-9 text-sm font-medium"
      >
        Apply Now
      </Button>
      <button
        onClick={() => onViewDetails(opp)}
        className="flex items-center gap-1 px-3 h-9 text-sm text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors font-medium"
      >
        Details <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

export default Opportunities;
