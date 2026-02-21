import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../Components/Header";
import Footer from "../../Components/Footer";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
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
  CheckCircle,
  Share2,
  Bookmark
} from "lucide-react";
import { api } from "../../utils/api";

const OpportunityDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [resumeCompleted, setResumeCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setResumeCompleted(parsedUser.resumeComplete || false);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch job details from API
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getJobById(id);
        // Backend returns { success: true, job: {...} }
        if (response.success && response.job) {
          setJob(response.job);
        } else if (response._id || response.id) {
          setJob(response);
        } else {
          // Fallback to mock data if API fails
          setJob(getMockJob(id));
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details.");
        setJob(getMockJob(id));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  // Mock job data as fallback
  const getMockJob = (jobId) => {
    const mockJobs = {
      "1": {
        _id: "1",
        title: "Frontend Developer Intern",
        company: "Leapfrog Technology",
        type: "Internship",
        location: "Kathmandu",
        duration: "3 months",
        description: "Join our team to work on modern React applications and learn from industry experts. You will be working on real-world projects and gaining hands-on experience with cutting-edge technologies.",
        salary: "NPR 15,000/month",
        skills: ["React", "JavaScript", "Tailwind CSS", "Git", "REST APIs"],
        deadline: "2026-03-15",
        logo: "🚀",
        requirements: [
          "Currently pursuing or recently completed Bachelor's degree in Computer Science or related field",
          "Basic understanding of React and JavaScript",
          "Familiarity with version control (Git)",
          "Good problem-solving skills",
          "Excellent communication skills"
        ],
        responsibilities: [
          "Develop and maintain web applications using React",
          "Collaborate with the design team to implement UI/UX designs",
          "Write clean, maintainable code",
          "Participate in code reviews",
          "Learn and adapt to new technologies"
        ],
        benefits: [
          "Mentorship from senior developers",
          "Flexible working hours",
          "Certificate upon completion",
          "Possibility of full-time offer"
        ],
        postedDate: "2026-02-01",
        applicants: 45
      },
      "2": {
        _id: "2",
        title: "Data Analyst",
        company: "Verisk Nepal",
        type: "Job",
        location: "Lalitpur",
        duration: "Full-time",
        description: "Analyze large datasets and create actionable insights for business decisions. Work with cross-functional teams to deliver data-driven solutions.",
        salary: "NPR 60,000 - 80,000/month",
        skills: ["Python", "SQL", "Excel", "Tableau", "Statistics"],
        deadline: "2026-03-20",
        logo: "📊",
        requirements: [
          "Bachelor's degree in Statistics, Mathematics, Computer Science, or related field",
          "2+ years of experience in data analysis",
          "Proficiency in SQL and Python",
          "Experience with data visualization tools",
          "Strong analytical skills"
        ],
        responsibilities: [
          "Analyze complex datasets to identify trends and insights",
          "Create reports and dashboards for stakeholders",
          "Collaborate with teams to understand data needs",
          "Develop and maintain data pipelines",
          "Present findings to management"
        ],
        benefits: [
          "Health insurance",
          "Annual bonus",
          "Professional development opportunities",
          "Work from home options"
        ],
        postedDate: "2026-02-05",
        applicants: 78
      }
    };
    
    return mockJobs[jobId] || {
      _id: jobId,
      title: "Job Position",
      company: "Company Name",
      type: "Job",
      location: "Kathmandu",
      duration: "Full-time",
      description: "Job description will be loaded here.",
      salary: "Negotiable",
      skills: ["Skill 1", "Skill 2"],
      deadline: "2026-03-30",
      logo: "💼",
      requirements: ["Requirement 1", "Requirement 2"],
      responsibilities: ["Responsibility 1", "Responsibility 2"],
      benefits: ["Benefit 1", "Benefit 2"],
      postedDate: "2026-02-01",
      applicants: 0
    };
  };

  const handleApply = () => {
    if (!user) {
      navigate("/applicant/login");
      return;
    }
    if (!resumeCompleted) {
      alert("Please complete your resume before applying.");
      navigate("/applicant/resume");
      return;
    }
    alert(`Applied successfully for ${job.title} at ${job.company}!`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this opportunity: ${job.title} at ${job.company}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading opportunity details...</span>
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
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Job</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/opportunities")}>
              Back to Opportunities
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Resume Warning */}
        {user && !resumeCompleted && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-base text-amber-900">
              <strong>Complete Your Resume First!</strong><br />
              You need to complete your resume before you can apply for this opportunity.{" "}
              <button
                onClick={() => navigate("/applicant/resume")}
                className="underline hover:text-amber-700 font-medium"
              >
                Build your resume now
              </button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex items-center justify-center w-16 h-16 bg-gray-100 rounded-xl">
                    {job.logo || <Building2 className="w-8 h-8 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                    <p className="text-lg text-gray-600 mb-3">{job.company}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                    </div>
                  </div>
                  <Badge className={job.type === "Job" ? "bg-blue-600" : "bg-green-600"}>
                    {job.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <Briefcase className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button
                    onClick={handleApply}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
                    disabled={user && !resumeCompleted}
                  >
                    Apply Now
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                      {isBookmarked ? "Saved" : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  {!user && (
                    <p className="text-sm text-gray-600 text-center">
                      <button
                        onClick={() => navigate("/applicant/login")}
                        className="text-blue-600 hover:underline"
                      >
                        Login
                      </button>
                      {" "}to apply for this opportunity
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Posted
                  </span>
                  <span className="font-medium">{job.postedDate || "Recently"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Deadline
                  </span>
                  <span className="font-medium">{job.deadline || "Open"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Applicants
                  </span>
                  <span className="font-medium">{job.applicants || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Type
                  </span>
                  <Badge variant="outline">{job.type}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Company Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About {job.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                    {job.logo || <Building2 className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div>
                    <h3 className="font-bold">{job.company}</h3>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Company Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OpportunityDetails;
