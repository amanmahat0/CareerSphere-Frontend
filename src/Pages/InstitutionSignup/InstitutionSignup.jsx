import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, User } from "lucide-react";
import Header from "../../Components/Header";
import { api } from "../../utils/api";

const InstitutionSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    institutionName: "",
    email: "",
    phonenumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!formData.institutionName || !formData.email || !formData.phonenumber || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions");
      setLoading(false);
      return;
    }

    try {
      const response = await api.signup(
        formData.institutionName.trim(),
        formData.email.trim(),
        formData.phonenumber.trim(),
        formData.password,
        "institution"
      );
      
      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("userType", "institution");
      
      setSuccess(true);
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (error) {
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9ff]">
      <Header />

      {/* Signup Card */}
      <div className="flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 relative">
          {/* Back Button */}
          <button
            onClick={() => navigate("/institution-login")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          {/* Toggle Buttons */}
          <div className="flex gap-4 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => navigate("/applicant-signup")}
              className="flex-1 py-2 px-4 rounded-md text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Applicant
            </button>
            <button
              type="button"
              className="flex-1 py-2 px-4 rounded-md bg-blue-600 text-white text-sm font-medium transition-colors"
            >
              Company/Institution
            </button>
          </div>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign up as an institution or company
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                Account created successfully! Redirecting...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Institution/Company Name */}
            <div className="mb-4">
              <label className="text-sm font-medium">Institution/Company Name</label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  placeholder="ABC University / XYZ Company"
                  className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="text-sm font-medium">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="institution@example.com"
                  className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-6">
              <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 rounded"
                  required
                />
                <span>
                  I agree to all the{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    terms and conditions
                  </a>
                </span>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading || !agreeToTerms}
              className="w-full bg-[#1f3a8a] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#1a2f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Sign in */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/institution-login")}
              className="text-blue-600 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Chat Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-12 h-12 rounded-full bg-[#1f3a8a] text-white flex items-center justify-center shadow-lg hover:bg-[#1a2f73] transition-colors">
          💬
        </button>
      </div>
    </div>
  );
};

export default InstitutionSignup;

