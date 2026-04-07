import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Briefcase, 
  FileText, 
  BarChart, 
  Users, 
  MapPin, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer';
import Header from '../../Components/Header';
import { api } from '../../utils/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchText, setSearchText] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOpportunities();
  }, [activeTab]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      let filters = {};
      
      if (activeTab !== 'all') {
        filters.type = activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1);
      }
      
      console.log('Fetching with filters:', filters);
      const response = await api.getAllJobs(filters);
      console.log('Full API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle different response structures
      let jobsData = [];
      
      // Check multiple possible response structures
      if (response?.data && Array.isArray(response.data)) {
        jobsData = response.data;
        console.log('Using response.data');
      } else if (response?.success && Array.isArray(response?.jobs)) {
        jobsData = response.jobs;
        console.log('Using response.jobs');
      } else if (Array.isArray(response)) {
        jobsData = response;
        console.log('Response is direct array');
      } else if (response?.message && response?.data) {
        jobsData = response.data;
        console.log('Using response.data from success message');
      }
      
      console.log('Parsed jobs data:', jobsData);
      console.log('Jobs count:', jobsData.length);
      
      if (jobsData.length > 0) {
        console.log('First job object:', JSON.stringify(jobsData[0], null, 2));
      }
      
      const slicedData = jobsData.slice(0, 6);
      console.log('After slice:', slicedData.length);
      setOpportunities(slicedData);
      console.log('Set opportunities state to:', slicedData.length, 'items');
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setError(error.message || 'Failed to load opportunities');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const query = searchText.toLowerCase();
    return (
      opp.title?.toLowerCase().includes(query) ||
      opp.company?.toLowerCase().includes(query) ||
      opp.location?.toLowerCase().includes(query)
    );
  });

  const handleViewAll = () => {
    navigate('/opportunities');
  };
  return (
    <div className="font-sans text-gray-800 bg-white">
      {/* ================= NAVBAR ================= */}
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              From College to Career, <br />
              <span className="text-blue-600">Simplified</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
              Connect with Nepal's top companies, build your professional profile, and accelerate your career journey with CareerSphere  Nepal's leading placement and internship portal.
            </p>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center max-w-md">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input 
                type="text" 
                placeholder="Search for jobs, internships, companies..." 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 px-4 py-2 outline-none text-gray-700 placeholder-gray-400"
              />
              <button 
                onClick={() => navigate('/opportunities')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>

            <div className="flex space-x-4 pt-2">
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
                Get Started Free
              </button>
              <button className="border border-blue-600 text-blue-600 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition">
                Learn More
              </button>
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div className="relative">
             {/* Note: Replace src with your actual image asset */}
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-gray-200 h-[400px] flex items-center justify-center relative">
               <img 
                 src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                 alt="Graduates celebrating" 
                 className="w-full h-full object-cover"
               />
               {/* Decorative elements */}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Career Success in Nepal
            </h2>
            <p className="text-gray-600">
              Comprehensive tools and resources designed specifically for Nepal's growing job market.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Briefcase className="w-6 h-6 text-white" />}
              title="Apply for Jobs & Traineeships"
              desc="Access opportunities from Nepal's top companies like Leapfrog, F1Soft, and emerging startups."
            />
            <FeatureCard 
              icon={<FileText className="w-6 h-6 text-white" />}
              title="Resume Builder"
              desc="Create professional resumes tailored for Nepal's job market with templates designed by experts."
            />
            <FeatureCard 
              icon={<BarChart className="w-6 h-6 text-white" />}
              title="Interview Tracking"
              desc="Track your applications and prepare for interviews with insights from leading companies."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-white" />}
              title="Placement Statistics"
              desc="Get insights into placement rates, salary trends, and career progression data specific to Nepal."
            />
          </div>
        </div>
      </section>

      {/* ================= OPPORTUNITIES SECTION ================= */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Latest Opportunities in Nepal</h2>
              <p className="text-gray-600 text-sm">Fresh openings from Nepal's top companies</p>
            </div>
            <button 
              onClick={handleViewAll}
              className="text-blue-600 text-sm font-medium hover:underline flex items-center border border-gray-300 bg-white px-4 py-1.5 rounded-md"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mb-8 border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'jobs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Jobs
            </button>
            <button 
              onClick={() => setActiveTab('internships')}
              className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'internships' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Internships
            </button>
            <button 
              onClick={() => setActiveTab('traineeships')}
              className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'traineeships' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Traineeships
            </button>
            <button 
              onClick={() => setActiveTab('all')}
              className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              All
            </button>
          </div>

          {/* Job Grid */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
              <p className="font-medium">Error loading opportunities:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-600 mr-2" size={32} />
              <p className="text-gray-600">Loading opportunities...</p>
            </div>
          ) : opportunities.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {opportunities.map((opp) => {
                console.log('Rendering card for:', opp);
                return (
                  <JobCard 
                    key={opp._id}
                    id={opp._id}
                    title={opp.title}
                    company={opp.company}
                    location={opp.location}
                    exp={opp.experienceRequired || '0-2 years'}
                    salary={opp.salary || 'Competitive'}
                    tag={opp.type}
                    data={opp}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No opportunities found</p>
            </div>
          )}
        </div>
      </section>

      {/* ================= CTA BANNER ================= */}
      <section className="bg-blue-700 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Launch Your Career in Nepal?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join CareerSphere and discover opportunities in jobs, internships, and traineeships across Nepal's growing industries.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-blue-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
};

/* Helper Components */

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition text-center flex flex-col items-center">
    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const JobCard = ({ id, title, company, location, exp, salary, tag, data }) => {
  const navigate = useNavigate();
  
  // Fallback to data object if individual props are missing
  const displayTitle = title || data?.jobTitle || data?.title || 'Job Title';
  const displayCompany = company || data?.companyName || data?.company || 'Company';
  const displayLocation = location || data?.city || data?.location || 'Location';
  const displayExp = exp || data?.experienceRequired || '0-2 years';
  const displaySalary = salary || data?.salary || 'Competitive';
  const displayTag = tag || data?.type || 'Job';
  
  return (
    <div 
      onClick={() => navigate(`/opportunities/${id}`)}
      className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded">{displayTag}</span>
      </div>
      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600">{displayTitle}</h3>
      <p className="text-blue-600 font-medium text-sm mb-4">{displayCompany}</p>
      
      <div className="flex items-center text-gray-500 text-xs mb-6">
        <MapPin className="w-3 h-3 mr-1" /> {displayLocation}
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-medium text-gray-700">
        <span>{displayExp}</span>
        <span>{displaySalary}</span>
      </div>
    </div>
  );
};

export default HomePage;