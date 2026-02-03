import React from 'react';
import { 
  Search, 
  Briefcase, 
  FileText, 
  BarChart, 
  Users, 
  MapPin, 
  ChevronRight
} from 'lucide-react';
import Footer from '../../Components/Footer';
import Header from '../../Components/Header';

const HomePage = () => {
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
              Connect with Nepal's top companies, build your professional profile, and accelerate your career journey with CareerSphere — Nepal's leading placement and internship portal.
            </p>

            {/* Search Bar */}
            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex items-center max-w-md">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input 
                type="text" 
                placeholder="Search for jobs, internships, companies..." 
                className="flex-1 px-4 py-2 outline-none text-gray-700 placeholder-gray-400"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
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
            <button className="text-blue-600 text-sm font-medium hover:underline flex items-center border border-gray-300 bg-white px-4 py-1.5 rounded-md">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mb-8 border-b border-gray-200">
            <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">Jobs</button>
            <button className="pb-3 text-gray-500 hover:text-gray-700 font-medium text-sm">Internships</button>
            <button className="pb-3 text-gray-500 hover:text-gray-700 font-medium text-sm">Traineeships</button>
          </div>

          {/* Job Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <JobCard 
              title="Data Analyst"
              company="F1Soft International"
              location="Pokhara"
              exp="0-2 years"
              salary="NPR 6-8 Lakhs/year"
              tag="Full time"
            />
            <JobCard 
              title="Flutter Developer"
              company="Yomari"
              location="Kathmandu"
              exp="1-3 years"
              salary="NPR 8-12 Lakhs/year"
              tag="Full time"
            />
            <JobCard 
              title="Backend Developer"
              company="Verisk Nepal"
              location="Kathmandu"
              exp="2-4 years"
              salary="NPR 10-15 Lakhs/year"
              tag="Full time"
            />
          </div>
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
            <button className="border border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition">
              Sign In
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

const JobCard = ({ title, company, location, exp, salary, tag }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition group cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded">{tag}</span>
    </div>
    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600">{title}</h3>
    <p className="text-blue-600 font-medium text-sm mb-4">{company}</p>
    
    <div className="flex items-center text-gray-500 text-xs mb-6">
      <MapPin className="w-3 h-3 mr-1" /> {location}
    </div>

    <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-medium text-gray-700">
      <span>{exp}</span>
      <span>{salary}</span>
    </div>
  </div>
);

export default HomePage;