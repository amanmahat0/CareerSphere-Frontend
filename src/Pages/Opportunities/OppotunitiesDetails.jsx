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
import ApplyModal from "./ApplyNow";

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

  // Check if user is logged in and fetch resume status
  useEffect(() => {
    const loadUserAndResumeStatus = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Fetch resume completion status from API
          try {
            const resumeResponse = await api.getResume();
            const isResumeComplete = resumeResponse.success && resumeResponse.data && resumeResponse.data.isComplete;
            setResumeCompleted(isResumeComplete);
            
            // Store in localStorage for fallback
            localStorage.setItem('resumeComplete', JSON.stringify(isResumeComplete));
          } catch (error) {
            console.error("Error fetching resume status:", error);
            // Fall back to localStorage
            const storedResumeComplete = localStorage.getItem('resumeComplete');
            setResumeCompleted(storedResumeComplete ? JSON.parse(storedResumeComplete) : false);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };
    
    loadUserAndResumeStatus();
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
          setError("Failed to load job details.");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);

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
    setShowApplyModal(true);
  };

  const handleApplicationSuccess = (applicationData) => {
    // Optionally update UI after successful application
    console.log("Application submitted successfully:", applicationData);
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
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-xl">
                    <Building2 className="w-8 h-8 text-gray-400" />
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
                        <span className="text-gray-400 font-bold">•</span>
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
                        <span className="text-gray-400 font-bold">•</span>
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
                        <span className="text-gray-400 font-bold">•</span>
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
                <CardTitle className="text-lg">About {job.company?.name || job.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">{job.company?.name || job.company}</h3>
                    <p className="text-sm text-gray-600">{job.company?.location || job.location}</p>
                  </div>
                </div>
                {(job.companyDescription || job.company?.description) && (
                  <p className="text-sm text-gray-600">{job.companyDescription || job.company?.description}</p>
                )}
              </CardContent>
            </Card>

            {/* Connect with Company Card */}
            {(job.website || job.company?.website || job.linkedin || job.twitter || job.facebook || job.company?.linkedin || job.company?.twitter || job.company?.facebook) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Connect with {job.company?.name || job.company}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(job.website || job.company?.website) && (
                      <a 
                        href={job.website || job.company?.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-2 text-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                      >
                        Visit Website
                      </a>
                    )}
                    {(job.linkedin || job.company?.linkedin || job.twitter || job.company?.twitter || job.facebook || job.company?.facebook) && (
                      <div className="flex gap-2">
                        {(job.linkedin || job.company?.linkedin) && (
                          <a 
                            href={job.linkedin || job.company?.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 text-center bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                            title="LinkedIn"
                          >
                            LinkedIn
                          </a>
                        )}
                        {(job.twitter || job.company?.twitter) && (
                          <a 
                            href={job.twitter || job.company?.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 text-center bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                            title="Twitter"
                          >
                            Twitter
                          </a>
                        )}
                        {(job.facebook || job.company?.facebook) && (
                          <a 
                            href={job.facebook || job.company?.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 text-center bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                            title="Facebook"
                          >
                            Facebook
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && job && (
        <ApplyModal 
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OpportunityDetails;
