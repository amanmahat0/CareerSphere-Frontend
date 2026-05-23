import React from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const TermsOfService = () => (
  <div className="font-sans text-gray-800 bg-white min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <section className="bg-linear-to-b from-blue-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: January 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Section title="1. Acceptance of Terms">
            <p>By accessing or using CareerSphere, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </Section>
          <Section title="2. Eligibility">
            <p>You must be at least 16 years old to create an account. By registering, you confirm that the information you provide is accurate and up to date.</p>
          </Section>
          <Section title="3. Applicant Responsibilities">
            <p>Applicants are responsible for the accuracy of their profile, resume, and application materials. Misrepresentation may result in account suspension.</p>
          </Section>
          <Section title="4. Company Responsibilities">
            <p>Companies agree to post only legitimate, legal job opportunities and to treat all applicants fairly and without discrimination.</p>
          </Section>
          <Section title="5. Prohibited Conduct">
            <p>You may not use CareerSphere to scrape data, spam users, post fraudulent listings, or engage in any activity that violates applicable law.</p>
          </Section>
          <Section title="6. Intellectual Property">
            <p>All content on CareerSphere  including the platform design, logos, and text  is owned by CareerSphere and may not be reproduced without permission.</p>
          </Section>
          <Section title="7. Termination">
            <p>We reserve the right to suspend or terminate accounts that violate these terms at our sole discretion.</p>
          </Section>
          <Section title="8. Contact">
            <p>For legal enquiries, contact support@careersphere.com.np.</p>
          </Section>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default TermsOfService;
