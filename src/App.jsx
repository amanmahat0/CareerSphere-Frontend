import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';
import ChatBot from './Components/ChatBot';
import Alert from './Pages/Alert/Alert.jsx';
import HomePage from './Pages/Home/home.jsx';
import ApplicantLogin from './Pages/Applicant/Login/ApplicantLogin.jsx';
import CompanyLogin from './Pages/Company/Login/CompanyLogin.jsx';
import ApplicantSignup from './Pages/Applicant/Signup/ApplicantSignup.jsx';
import CompanySignup from './Pages/Company/Signup/CompanySignup.jsx';
import ApplicantForgotPassword from './Pages/Applicant/ForgotPassword/ApplicantForgotPassword.jsx';
import CompanyForgotPassword from './Pages/Company/ForgotPassword/CompanyForgotPassword.jsx';
import ApplicantDashboard from './Pages/Applicant/Dashboard/ApplicantDashboard.jsx';
import ApplicantProfile from './Pages/Applicant/Profile/ApplicantProfile.jsx';
import ResumeBuilder from './Pages/Applicant/ResumeBuilder/ResumeBuilder.jsx';
import MyApplication from './Pages/Applicant/My Applications/MyApplication.jsx';
import ApplicantNotification from './Pages/Applicant/Notifications/ApplicantNotification.jsx';
import InterviewSchedule from './Pages/Applicant/InterviewSchedule/InterviewSchedule.jsx';
import SavedJobs from './Pages/Applicant/SavedJobs/SavedJobs.jsx';
import CompanyDashboard from './Pages/Company/Dashboard/CompanyDashboard.jsx';
import CompanyProfile from './Pages/Company/Profile/CompanyProfile.jsx';
import JobManagement from './Pages/Company/Dashboard/JobManagement.jsx';
import Applications from './Pages/Company/Applications/Applications.jsx';
import InterviewManagement from './Pages/Company/Interview/InterviewManagement.jsx';
import CompanyNotifications from './Pages/Company/Notifications/CompanyNotifications.jsx';
import CompanyCertificates from './Pages/Company/Certificates/CompanyCertificates.jsx';
import ApplicantCertificates from './Pages/Applicant/Certificates/ApplicantCertificates.jsx';
import AdminDashboard from './Pages/Admin/Dashboard/AdminDashboard.jsx';
import ApplicantManagement from './Pages/Admin/ApplicantManagement/ApplicantManagement.jsx';
import CompanyManagement from './Pages/Admin/CompanyManagement/CompanyManagement.jsx';
import AdminApplications from './Pages/Admin/ApplicationManagement/Applications.jsx';
import AdminInterview from './Pages/Admin/Interview/AdminInterview.jsx';
import AdminCertificates from './Pages/Admin/Certificates/AdminCertificates.jsx';
import AdminSettings from './Pages/Admin/Settings/AdminSettings.jsx';
import AdminNotifications from './Pages/Admin/Notifications/AdminNotifications.jsx';
import ContactPage from './Components/Contact.jsx';
import { AboutPage } from './Components/About.jsx';
import Opportunities from './Pages/Opportunities/Oppotunities.jsx';
import OpportunityDetails from './Pages/Opportunities/OppotunitiesDetails.jsx';
import HowItWorks from './Pages/Info/HowItWorks.jsx';
import HelpCenter from './Pages/Info/HelpCenter.jsx';
import PrivacyPolicy from './Pages/Info/PrivacyPolicy.jsx';
import TermsOfService from './Pages/Info/TermsOfService.jsx';
import CookiePolicy from './Pages/Info/CookiePolicy.jsx';
import Accessibility from './Pages/Info/Accessibility.jsx';

const APPLICANT  = ['applicant'];
const COMPANY    = ['institution'];
const ADMIN      = ['admin'];

function App() {
  const location = useLocation();
  const showChatbot = !location.pathname.startsWith('/company') && !location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"                          element={<HomePage />} />
        <Route path="/applicant/login"           element={<ApplicantLogin />} />
        <Route path="/login"                     element={<ApplicantLogin />} />
        <Route path="/signin"                    element={<ApplicantSignup />} />
        <Route path="/company/login"             element={<CompanyLogin />} />
        <Route path="/applicant/signup"          element={<ApplicantSignup />} />
        <Route path="/company/signup"            element={<CompanySignup />} />
        <Route path="/applicant/forgot-password" element={<ApplicantForgotPassword />} />
        <Route path="/company/forgot-password"   element={<CompanyForgotPassword />} />
        <Route path="/contact"                   element={<ContactPage />} />
        <Route path="/about"                     element={<AboutPage />} />
        <Route path="/opportunities"             element={<Opportunities />} />
        <Route path="/opportunities/:id"         element={<OpportunityDetails />} />
        <Route path="/jobs"                      element={<Opportunities />} />
        <Route path="/internships"               element={<Opportunities />} />
        <Route path="/how-it-works"              element={<HowItWorks />} />
        <Route path="/help"                      element={<HelpCenter />} />
        <Route path="/privacy-policy"            element={<PrivacyPolicy />} />
        <Route path="/terms"                     element={<TermsOfService />} />
        <Route path="/cookies"                   element={<CookiePolicy />} />
        <Route path="/accessibility"             element={<Accessibility />} />

        {/* ── Applicant (must be logged in as applicant) ── */}
        <Route path="/applicant/dashboard"    element={<ProtectedRoute allowedRoles={APPLICANT} element={<ApplicantDashboard />} />} />
        <Route path="/applicant/profile"      element={<ProtectedRoute allowedRoles={APPLICANT} element={<ApplicantProfile />} />} />
        <Route path="/applicant/resume"       element={<ProtectedRoute allowedRoles={APPLICANT} element={<ResumeBuilder />} />} />
        <Route path="/applicant/applications" element={<ProtectedRoute allowedRoles={APPLICANT} element={<MyApplication />} />} />
        <Route path="/applicant/notifications"element={<ProtectedRoute allowedRoles={APPLICANT} element={<ApplicantNotification />} />} />
        <Route path="/applicant/interviews"   element={<ProtectedRoute allowedRoles={APPLICANT} element={<InterviewSchedule />} />} />
        <Route path="/applicant/saved-jobs"   element={<ProtectedRoute allowedRoles={APPLICANT} element={<SavedJobs />} />} />
        <Route path="/applicant/certificates" element={<ProtectedRoute allowedRoles={APPLICANT} element={<ApplicantCertificates />} />} />

        {/* ── Company (must be logged in as institution) ── */}
        <Route path="/company/dashboard"     element={<ProtectedRoute allowedRoles={COMPANY} element={<CompanyDashboard />} />} />
        <Route path="/company/profile"       element={<ProtectedRoute allowedRoles={COMPANY} element={<CompanyProfile />} />} />
        <Route path="/company/jobs"          element={<ProtectedRoute allowedRoles={COMPANY} element={<JobManagement />} />} />
        <Route path="/company/applications"  element={<ProtectedRoute allowedRoles={COMPANY} element={<Applications />} />} />
        <Route path="/company/interviews"    element={<ProtectedRoute allowedRoles={COMPANY} element={<InterviewManagement />} />} />
        <Route path="/company/notifications" element={<ProtectedRoute allowedRoles={COMPANY} element={<CompanyNotifications />} />} />
        <Route path="/company/certificates"  element={<ProtectedRoute allowedRoles={COMPANY} element={<CompanyCertificates />} />} />

        {/* ── Admin (must be logged in as admin) ── */}
        <Route path="/admin"                  element={<ProtectedRoute allowedRoles={ADMIN} element={<AdminDashboard />} />} />
        <Route path="/admin/dashboard"        element={<ProtectedRoute allowedRoles={ADMIN} element={<AdminDashboard />} />} />
        <Route path="/admin/applicants"       element={<ProtectedRoute allowedRoles={ADMIN} element={<ApplicantManagement />} />} />
        <Route path="/admin/companies"        element={<ProtectedRoute allowedRoles={ADMIN} element={<CompanyManagement />} />} />
        <Route path="/admin/applications"     element={<ProtectedRoute allowedRoles={ADMIN} element={<AdminApplications />} />} />
        <Route path="/admin/interviews"       element={<ProtectedRoute allowedRoles={ADMIN} element={<AdminInterview />} />} />
        <Route path="/admin/certificates"     element={<ProtectedRoute allowedRoles={ADMIN} element={<AdminCertificates />} />} />
        <Route path="/admin/settings"         element={<ProtectedRoute allowedRoles={ADMIN} element={<AdminSettings />} />} />
        <Route path="/admin/notifications"    element={<ProtectedRoute allowedRoles={ADMIN} element={<AdminNotifications />} />} />
      </Routes>
      <Alert />
      {showChatbot && <ChatBot />}
    </>
  );
}

export default App;
