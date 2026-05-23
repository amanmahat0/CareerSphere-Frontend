import React from 'react';
import { Search, UserCheck, Briefcase, Award } from 'lucide-react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

const steps = [
  {
    Icon: UserCheck,
    title: 'Create Your Profile',
    desc: 'Sign up as a student or fresh graduate. Build your profile, upload your resume, and let companies discover you.',
  },
  {
    Icon: Search,
    title: 'Explore Opportunities',
    desc: "Browse hundreds of jobs, internships, and traineeships from Nepal's top companies and startups.",
  },
  {
    Icon: Briefcase,
    title: 'Apply with One Click',
    desc: 'Apply directly from the platform. Track every application status in real time from your dashboard.',
  },
  {
    Icon: Award,
    title: 'Get Hired',
    desc: 'Complete the interview process inside CareerSphere — tests, interviews, offer letter, and placement confirmation.',
  },
];

const HowItWorks = () => (
  <div className="font-sans text-gray-800 bg-white min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <section className="bg-linear-to-b from-blue-50 to-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">How CareerSphere Works</h1>
          <p className="text-gray-600 text-lg">
            From your first profile to your first paycheck — here's how we simplify the journey.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          {steps.map(({ Icon, title, desc }, i) => (
            <div key={i} className="flex gap-5 items-start bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="shrink-0 w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{`${i + 1}. ${title}`}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default HowItWorks;
