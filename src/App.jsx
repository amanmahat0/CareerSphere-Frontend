import './App.css'
import { Routes, Route } from 'react-router-dom';
import HomePage from './Pages/Home/home.jsx';
import ApplicantLogin from './Pages/Applicant/Login/ApplicantLogin.jsx';
import CompanyLogin from './Pages/Company/Login/CompanyLogin.jsx';
import ApplicantSignup from './Pages/Applicant/Signup/ApplicantSignup.jsx';
import CompanySignup from './Pages/Company/Signup/CompanySignup.jsx';
import ApplicantForgotPassword from './Pages/Applicant/ForgotPassword/ApplicantForgotPassword.jsx';
import CompanyForgotPassword from './Pages/Company/ForgotPassword/CompanyForgotPassword.jsx';
import ApplicantDashboard from './Pages/Applicant/Dashboard/ApplicantDashboard.jsx';
import ApplicantProfile from './Pages/Applicant/Profile/ApplicantProfile.jsx';
import CompanyDashboard from './Pages/Company/Dashboard/CompanyDashboard.jsx';
import CompanyProfile from './Pages/Company/Profile/CompanyProfile.jsx';
import JobManagement from './Pages/Company/Dashboard/JobManagement.jsx';
import AdminDashboard from './Pages/Admin/Dashboard/AdminDashboard.jsx';
import ApplicantManagement from './Pages/Admin/ApplicantManagement/ApplicantManagement.jsx';
import CompanyManagement from './Pages/Admin/CompanyManagement/CompanyManagement.jsx';
import ContactPage  from './Components/Contact.jsx';
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/applicant/login" element={<ApplicantLogin />} />
      <Route path="/login" element={<ApplicantLogin />} />
      <Route path="/company/login" element={<CompanyLogin />} />
      <Route path="/applicant/signup" element={<ApplicantSignup />} />
      <Route path="/company/signup" element={<CompanySignup />} />
      <Route path="/applicant/forgot-password" element={<ApplicantForgotPassword />} />
      <Route path="/company/forgot-password" element={<CompanyForgotPassword />} />
      <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
      <Route path="/applicant/profile" element={<ApplicantProfile />} />
      <Route path="/contact" element={<ContactPage />} />
      
      {/* Company Routes */}
      <Route path="/company/dashboard" element={<CompanyDashboard />} />
      <Route path="/company/profile" element={<CompanyProfile />} />
      <Route path="/company/jobs" element={<JobManagement />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/applicants" element={<ApplicantManagement />} />
      <Route path="/admin/companies" element={<CompanyManagement />} />
    </Routes>
  );
}

export default App;
