import './App.css'
import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login.jsx';
import CompanyLogin from './Pages/Company/Login/CompanyLogin.jsx';
import ApplicantSignup from './Pages/Applicant/Signup/ApplicantSignup.jsx';
import CompanySignup from './Pages/Company/Signup/CompanySignup.jsx';
import ApplicantForgotPassword from './Pages/Applicant/ForgotPassword/ApplicantForgotPassword.jsx';
import CompanyForgotPassword from './Pages/Company/ForgotPassword/CompanyForgotPassword.jsx';
import ApplicantDashboard from './Pages/Applicant/Dashboard/ApplicantDashboard.jsx';
import CompanyDashboard from './Pages/Company/Dashboard/CompanyDashboard.jsx';
import JobManagement from './Pages/Company/Dashboard/JobManagement.jsx';
import AdminDashboard from './Pages/Admin/Dashboard/AdminDashboard.jsx';
import UserManagement from './Pages/Admin/Dashboard/UserManagement.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/company/login" element={<CompanyLogin />} />
      <Route path="/applicant/signup" element={<ApplicantSignup />} />
      <Route path="/company/signup" element={<CompanySignup />} />
      <Route path="/applicant/forgot-password" element={<ApplicantForgotPassword />} />
      <Route path="/company/forgot-password" element={<CompanyForgotPassword />} />
      <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
      
      {/* Company Routes */}
      <Route path="/company/dashboard" element={<CompanyDashboard />} />
      <Route path="/company/jobs" element={<JobManagement />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
    </Routes>
  );
}

export default App;
