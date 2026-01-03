import './App.css'
import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login.jsx';
import InstitutionLogin from './Pages/InstitutionLogin/InstitutionLogin.jsx';
import ApplicantSignup from './Pages/ApplicantSignup/ApplicantSignup.jsx';
import InstitutionSignup from './Pages/InstitutionSignup/InstitutionSignup.jsx';
import ApplicantForgotPassword from './Pages/ApplicantForgotPassword/ApplicantForgotPassword.jsx';
import InstitutionForgotPassword from './Pages/InstitutionForgotPassword/InstitutionForgotPassword.jsx';
import ApplicantDashboard from './Pages/ApplicantDashboard/ApplicantDashboard.jsx';
import InstitutionDashboard from './Pages/InstitutionDashboard/InstitutionDashboard.jsx';
import AdminDashboard from './Pages/AdminDashboard/AdminDashboard.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/institution-login" element={<InstitutionLogin />} />
      <Route path="/applicant-signup" element={<ApplicantSignup />} />
      <Route path="/institution-signup" element={<InstitutionSignup />} />
      <Route path="/applicant-forgot-password" element={<ApplicantForgotPassword />} />
      <Route path="/institution-forgot-password" element={<InstitutionForgotPassword />} />
      <Route path="/applicant-dashboard" element={<ApplicantDashboard />} />
      <Route path="/institution-dashboard" element={<InstitutionDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
