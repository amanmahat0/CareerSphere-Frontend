import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  GraduationCap
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
        
        {/* Brand Col */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4 text-white">
            <div className="bg-blue-600 p-1 rounded">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">CareerSphere</span>
          </div>
          <p className="mb-4 leading-relaxed text-xs">
            Nepal's leading platform connecting students with career opportunities. From internships to placements, we simplify your journey from college to career.
          </p>
          <div className="space-y-1 text-xs">
            <p>support@careersphere.com.np</p>
            <p>+977 01-4567890</p>
            <p>Kathmandu, Bagmati Province, Nepal</p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-xs">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
            <li><Link to="/faq" className="hover:text-white">Help Center</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* For Applicants */}
        <div>
          <h3 className="text-white font-semibold mb-4">For Applicants</h3>
          <ul className="space-y-2 text-xs">
            <li><Link to="/jobs" className="hover:text-white">Find Jobs</Link></li>
            <li><Link to="/internships" className="hover:text-white">Find Internships</Link></li>
            <li><Link to="/resume-builder" className="hover:text-white">Resume Builder</Link></li>
          </ul>
        </div>

        {/* Social / Legal */}
        <div className="flex flex-col justify-between">
           <div className="flex space-x-4">
              {/* Social placeholders */}
              <Facebook className="w-5 h-5 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-white cursor-pointer" />
              <Linkedin className="w-5 h-5 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-white cursor-pointer" />
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between text-xs">
        <p>© 2026 CareerSphere. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          <Link to="/cookies" className="hover:text-white">Cookie Policy</Link>
          <Link to="/accessibility" className="hover:text-white">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
