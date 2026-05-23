import React from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const CookiePolicy = () => (
  <div className="font-sans text-gray-800 bg-white min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <section className="bg-linear-to-b from-blue-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Cookie Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: January 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Section title="What Are Cookies?">
            <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.</p>
          </Section>
          <Section title="Cookies We Use">
            <p><strong className="text-gray-800">Essential cookies</strong> : required for login sessions and core platform functionality. These cannot be disabled.</p>
            <p><strong className="text-gray-800">Analytics cookies</strong> : help us understand how visitors use the platform so we can improve it. Data is aggregated and anonymous.</p>
            <p><strong className="text-gray-800">Preference cookies</strong> : remember your settings, such as language and notification preferences.</p>
          </Section>
          <Section title="Third-Party Cookies">
            <p>Our live chat widget (Tawk.to) may set its own cookies. Please refer to Tawk.to's privacy policy for details.</p>
          </Section>
          <Section title="Managing Cookies">
            <p>You can control or delete cookies via your browser settings. Disabling essential cookies will affect platform functionality.</p>
          </Section>
          <Section title="Contact">
            <p>Questions? Email us at support@careersphere.com.np.</p>
          </Section>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default CookiePolicy;
