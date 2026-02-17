import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Header from "../../../Components/Header";
import { api } from "../../../utils/api";
import Footer from "../../../Components/footer";


const ApplicantSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
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
    if (!formData.fullname || !formData.email || !formData.phonenumber || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Name validation - cannot be only numbers
    if (/^[0-9]+$/.test(formData.fullname)) {
      setError("Name cannot contain only numbers");
      setLoading(false);
      return;
    }

    // Phone validation - only digits
    if (!/^[0-9]{10,}$/.test(formData.phonenumber.replace(/\D/g, ''))) {
      setError("Phone number must contain only digits (minimum 10 digits)");
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

    // Password validation - at least 1 capital letter and 1 special symbol
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one capital letter");
      setLoading(false);
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      setError("Password must contain at least one special symbol (!@#$%^&*)");
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
        formData.fullname.trim(),
        formData.email.trim(),
        formData.phonenumber.trim(),
        formData.password,
        "applicant"
      );
      
      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("userType", "applicant");
      
      setSuccess(true);
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate("/applicant/dashboard", { replace: true });
      }, 1500);
    } catch (error) {
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");

        // Get user info from Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const googleUser = await userInfoResponse.json();

        // Send to backend
        const response = await api.googleAuth(
          googleUser.sub,
          googleUser.email,
          googleUser.name,
          googleUser.picture,
          "applicant"
        );

        // Store token and user data
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("userType", "applicant");

        navigate("/applicant/dashboard", { replace: true });
      } catch (error) {
        setError(error.message || "Google signup failed");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google signup failed"),
  });

  return (
    <div className="min-h-screen bg-[#f6f9ff]" style={{
      backgroundImage: 'url("/images/bg-skyline.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'bottom',
      backgroundAttachment: 'fixed'
    }}>
      <Header />

      {/* Signup Card */}
      <div className="flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 relative">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 text-sm mt-2">Start your job search journey</p>
          </div>

          

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Aman Kumar Mahato"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="aman@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'phonenumber', value: digitsOnly } });
                  }}
                  placeholder="9800000000"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 mb-6">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1"
              />
              <span className="text-sm text-gray-800">
                I agree to the{" "}
                <button type="button" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </button>
              </span>
            </label>
            {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="flex justify-center items-center text-green-600 text-sm">Account created! Redirecting...</p>
            </div>
          )}
            {/* Error Message */}
            {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="flex justify-center items-center text-red-600 text-sm">{error}</p>
            </div>
            )}
            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading || !agreeToTerms}
              className="w-full bg-[#1f3a8a] text-white py-2 rounded-lg font-medium hover:bg-[#1a2f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Google Signup */}
          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleGoogleSignup()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Google
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/applicant/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </button>
          </p>
        </div>
      </div>
      <div><Footer /></div>
    </div>
  );
};

export default ApplicantSignup;