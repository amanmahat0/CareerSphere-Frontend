import React, { useState } from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: 'How do I create an account?',
    a: 'Click "Sign Up" in the top navigation, choose whether you\'re a student/applicant or a company, and fill in the registration form.',
  },
  {
    q: 'Is CareerSphere free for students?',
    a: 'Yes — creating a profile, building your resume, and applying to opportunities is completely free for applicants.',
  },
  {
    q: 'How do I track my application status?',
    a: 'Go to your dashboard and open "My Applications". Each application shows its current stage in the interview pipeline.',
  },
  {
    q: 'Can I withdraw an application?',
    a: 'Yes. You can withdraw an application as long as it is still in the pending, shortlisted, or test stage.',
  },
  {
    q: 'How do I contact a company?',
    a: 'Use the live chat widget (bottom-right corner) to reach our support team, or email support@careersphere.com.np.',
  },
  {
    q: 'I forgot my password. What do I do?',
    a: 'Click "Forgot Password" on the login page. We\'ll send a reset link to your registered email address.',
  },
];

const FAQ = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-5 py-4 text-left text-gray-900 font-medium hover:bg-gray-50 transition-colors"
      >
        {q}
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-gray-500" /> : <ChevronDown className="w-4 h-4 shrink-0 text-gray-500" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
          {a}
        </div>
      )}
    </div>
  );
};

const HelpCenter = () => (
  <div className="font-sans text-gray-800 bg-white min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <section className="bg-linear-to-b from-blue-50 to-white py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Help Center</h1>
          <p className="text-gray-600 text-lg">Answers to common questions about using CareerSphere.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 space-y-3">
          {faqs.map((item, i) => (
            <FAQ key={i} {...item} />
          ))}
        </div>
        <div className="max-w-2xl mx-auto px-4 mt-10 text-center">
          <p className="text-gray-500 text-sm">
            Still need help?{' '}
            <a href="mailto:support@careersphere.com.np" className="text-blue-600 hover:underline">
              Email us
            </a>
          </p>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default HelpCenter;
