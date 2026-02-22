import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../Components/Header";
import Footer from "../../Components/Footer";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Alert, AlertDescription } from "../../ui/alert";
import {
  ArrowLeft,
  Search,
  MapPin,
  Briefcase,
  Filter,
  Clock,
  AlertCircle,
  Building2,
  Loader2
} from "lucide-react";
import { api } from "../../utils/api";

// Nepal cities data
const nepalCities = [
  { name: "Kathmandu" },
  { name: "Pokhara" },
  { name: "Lalitpur" },
  { name: "Bhaktapur" },
  { name: "Biratnagar" },
  { name: "Birgunj" },
  { name: "Dharan" },
  { name: "Butwal" },
  { name: "Hetauda" },
  { name: "Chitwan" },
];

const Opportunities = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [resumeCompleted, setResumeCompleted] = useState(false);

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

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getAllJobs();
        // Backend returns { success: true, count: ..., jobs: [...] }
        if (response.success && response.jobs) {
          setJobs(response.jobs);
        } else if (Array.isArray(response)) {
          setJobs(response);
        } else {
          // Fallback to mock data if API fails
          setJobs(getMockJobs());
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load opportunities.");
        setJobs(getMockJobs());
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);


  // Filter opportunities based on search and filters
  const filteredOpportunities = jobs.filter(opp => {
    const matchesSearch =
      opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opp.skills && opp.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesType = filterType === "all" || opp.type === filterType;
    const matchesLocation = filterLocation === "all" || opp.location === filterLocation;

    return matchesSearch && matchesType && matchesLocation;
  });

  const handleApply = (opportunity) => {
    if (!user) {
      navigate("/applicant/login");
      return;
    }
    if (!resumeCompleted) {
      alert("Please complete your resume before applying.");
      navigate("/applicant/resume");
      return;
    }
    // Navigate to application or show modal
    alert(`Applying for ${opportunity.title} at ${opportunity.company}...`);
  };

  const handleViewDetails = (opportunity) => {
    navigate(`/opportunities/${opportunity._id || opportunity.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Search Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-10 w-[150px] pl-9 pr-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="Job">Jobs</option>
                  <option value="Internship">Internships</option>
                </select>
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="h-10 w-[150px] pl-9 pr-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  {nepalCities.map(city => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Resume Warning */}
        {user && !resumeCompleted && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-base text-amber-900">
              <strong>Complete Your Resume First!</strong><br />
              You need to complete your resume before you can apply for opportunities.{" "}
              <button
                onClick={() => navigate("/applicant/resume")}
                className="underline hover:text-amber-700 font-medium"
              >
                Build your resume now
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Not logged in warning */}
        {!user && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-base text-blue-900">
              <strong>Login to Apply!</strong><br />
              Please login or create an account to apply for opportunities.{" "}
              <button
                onClick={() => navigate("/applicant/login")}
                className="underline hover:text-blue-700 font-medium"
              >
                Login now
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-900">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading opportunities...</span>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOpportunities.map(opportunity => (
              <Card
                key={opportunity._id || opportunity.id}
                className="p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                    {opportunity.logo || <Building2 className="w-6 h-6 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{opportunity.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{opportunity.company}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {opportunity.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {opportunity.duration}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{opportunity.description}</p>

                {opportunity.skills && opportunity.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {opportunity.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {opportunity.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{opportunity.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mb-4 pb-3 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Badge className={opportunity.type === "Job" ? "bg-blue-600" : "bg-green-600"}>
                      {opportunity.type}
                    </Badge>
                    <span className="text-sm text-gray-700">{opportunity.salary}</span>
                  </div>
                  {opportunity.deadline && (
                    <span className="text-xs text-gray-500">Deadline: {opportunity.deadline}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApply(opportunity)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-9"
                    disabled={user && !resumeCompleted}
                  >
                    Apply Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-9"
                    onClick={() => handleViewDetails(opportunity)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Opportunities;