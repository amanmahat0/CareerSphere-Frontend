import React from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const Accessibility = () => (
  <div className="font-sans text-gray-800 bg-white min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <section className="bg-linear-to-b from-blue-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Accessibility</h1>
          <p className="text-gray-500 text-sm">Our commitment to inclusive design</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Section title="Our Commitment">
            <p>CareerSphere is committed to making our platform accessible to everyone, including people with disabilities. We strive to meet WCAG 2.1 Level AA guidelines.</p>
          </Section>
          <Section title="Features">
            <p><strong className="text-gray-800">Keyboard navigation</strong> : all interactive elements are reachable via keyboard.</p>
            <p><strong className="text-gray-800">Screen reader support</strong> : semantic HTML and ARIA labels are used throughout the platform.</p>
            <p><strong className="text-gray-800">Colour contrast</strong> : text and interactive elements meet minimum contrast ratios.</p>
            <p><strong className="text-gray-800">Responsive design</strong> : the platform adapts to different screen sizes and zoom levels.</p>
          </Section>
          <Section title="Known Issues">
            <p>We are aware of some areas that need improvement and are actively working on fixes. If you encounter a barrier, please let us know.</p>
          </Section>
          <Section title="Feedback & Contact">
            <p>If you experience any accessibility issue, please email us at support@careersphere.com.np with a description of the problem and the page URL.</p>
          </Section>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default Accessibility;
