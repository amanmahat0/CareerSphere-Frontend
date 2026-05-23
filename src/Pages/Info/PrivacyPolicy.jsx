import React from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const PrivacyPolicy = () => (
  <div className="font-sans text-gray-800 bg-white min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <section className="bg-linear-to-b from-blue-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: January 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Section title="1. Information We Collect">
            <p>We collect information you provide directly, such as your name, email address, resume, and profile details when you create an account or apply for opportunities.</p>
            <p>We also collect usage data  pages visited, search queries, and interaction logs  to improve the platform experience.</p>
          </Section>
          <Section title="2. How We Use Your Information">
            <p>Your information is used to match you with relevant opportunities, communicate application updates, and provide personalised recommendations.</p>
            <p>We do not sell your personal data to third parties.</p>
          </Section>
          <Section title="3. Data Sharing">
            <p>Application data (name, resume, cover letter) is shared with companies you apply to. We do not share your data with other companies without your consent.</p>
          </Section>
          <Section title="4. Data Retention">
            <p>Account data is retained for as long as your account is active. You may request deletion at any time by contacting support@careersphere.com.np.</p>
          </Section>
          <Section title="5. Your Rights">
            <p>You have the right to access, correct, or delete your personal data. Contact us at support@careersphere.com.np to exercise these rights.</p>
          </Section>
          <Section title="6. Contact">
            <p>Questions about this policy? Reach us at support@careersphere.com.np or at our office in Kathmandu, Nepal.</p>
          </Section>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
