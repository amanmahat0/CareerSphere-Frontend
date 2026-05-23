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

const isLoggedIn = () => !!localStorage.getItem('token');

const getTagClass = (tag) => {
  const t = (tag || '').toLowerCase();
  if (t.includes('intern')) return 'bg-green-50 text-green-700';
  if (t.includes('traine')) return 'bg-purple-50 text-purple-700';
  if (t.includes('job')) return 'bg-blue-50 text-blue-700';
  return 'bg-gray-100 text-gray-600';
};

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
      const filters = {};

      if (activeTab !== 'all') {
        filters.type = activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1);
      }

      const response = await api.getAllJobs(filters);

      let jobsData = [];
      if (response?.data && Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (response?.success && Array.isArray(response?.jobs)) {
        jobsData = response.jobs;
      } else if (Array.isArray(response)) {
        jobsData = response;
      } else if (response?.message && response?.data) {
        jobsData = response.data;
      }

      setOpportunities(jobsData.slice(0, 6));
    } catch (err) {
      setError(err.message || 'Failed to load opportunities');
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

  const handleGetStarted = () => {
    if (isLoggedIn()) {
      navigate('/opportunities');
    } else {
      navigate('/signin');
    }
  };

  return (
    <div className="font-sans text-gray-800 bg-white">
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="bg-linear-to-b from-blue-50 to-white pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              From College to Career.{' '}
              <span className="text-blue-600">Simplified.</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-lg">
              Connect with Nepal's top companies, build your professional profile, and accelerate your career journey with CareerSphere  Nepal's leading placement and internship portal.
            </p>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center max-w-md">
              <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
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
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/how-it-works')}
                className="border border-blue-600 text-blue-600 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-gray-200 h-[400px]">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Graduates celebrating"
                className="w-full h-full object-cover"
              />
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
              onClick={() => navigate('/opportunities')}
              className="text-blue-600 text-sm font-medium hover:underline flex items-center border border-gray-300 bg-white px-4 py-1.5 rounded-md"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mb-8 border-b border-gray-200">
            {['jobs', 'internships', 'traineeships', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
              <p className="font-medium">Error loading opportunities</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-blue-600 mr-2" size={32} />
              <p className="text-gray-600">Loading opportunities...</p>
            </div>
          ) : filteredOpportunities.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredOpportunities.map((opp) => (
                <JobCard
                  key={opp._id}
                  id={opp._id}
                  title={opp.title}
                  company={opp.company}
                  location={opp.location}
                  exp={opp.experienceRequired || '0–2 years'}
                  salary={opp.salary || 'Competitive'}
                  tag={opp.type}
                  data={opp}
                />
              ))}
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
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group bg-gray-50 hover:bg-blue-50 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition text-center flex flex-col items-center">
    <div className="w-12 h-12 bg-blue-600 group-hover:bg-blue-700 rounded-lg flex items-center justify-center mb-4 transition-colors">
      {icon}
    </div>
    <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const JobCard = ({ id, title, company, location, exp, salary, tag, data }) => {
  const navigate = useNavigate();

  const displayTitle    = title    || data?.jobTitle       || data?.title    || 'Job Title';
  const displayCompany  = company  || data?.companyName    || data?.company  || 'Company';
  const displayLocation = location || data?.city           || data?.location || 'Location';
  const displayExp      = exp      || data?.experienceRequired               || '0–2 years';
  const displaySalary   = salary   || data?.salary                          || 'Competitive';
  const displayTag      = tag      || data?.type                             || 'Job';

  return (
    <div
      onClick={() => navigate(`/opportunities/${id}`)}
      className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded ${getTagClass(displayTag)}`}>
          {displayTag}
        </span>
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
