import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { GraduationCap, Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import Header from "../../Components/Header";
import { api } from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
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

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await api.login(formData.email, formData.password);
      
      // Check if user type matches (applicant only)
      if (response.user.userType !== "applicant") {
        setError(`This account is registered as an ${response.user.userType}. Please use the ${response.user.userType} login page.`);
        setLoading(false);
        return;
      }
      
      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("userType", "applicant");
      
      // Navigate to applicant dashboard
      navigate("/applicant-dashboard", { replace: true });
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = useGoogleLogin({
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
          googleUser.sub, // Google ID
          googleUser.email,
          googleUser.name,
          googleUser.picture,
          "applicant" // Only applicants can use Google
        );

        // Store token and user data
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("userType", "applicant");

        // Navigate to applicant dashboard
        navigate("/applicant-dashboard", { replace: true });
      } catch (error) {
        setError(error.message || "Google login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google login failed. Please try again.");
    },
  });

  return (
    <div className="min-h-screen bg-[#f6f9ff]">
      <Header />

      {/* Login Card */}
      <div className="flex justify-center items-center py-20 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Welcome Back!</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                  placeholder="your.email@example.com"
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

            {/* Remember / Forgot */}
            <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => navigate("/applicant-forgot-password")}
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1f3a8a] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#1a2f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full border border-gray-200 py-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-4 h-4"
            />
            {loading ? "Signing in..." : "Login with Google"}
          </button>

          {/* Sign up */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/applicant-signup")}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </p>

          {/* Institution Box */}
          <button
            onClick={() => navigate("/institution-login")}
            className="mt-6 w-full bg-blue-50 p-4 rounded-lg flex items-center justify-between hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Building2 className="w-5 h-5 text-blue-600" />
            <div className="flex-1 text-left ml-3">
              <p className="text-sm font-medium text-gray-900">Institution or Company?</p>
              <p className="text-xs text-gray-500">
                Login or Register here
              </p>
            </div>
            <span className="text-blue-600 text-xl">→</span>
          </button>
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

export default Login;
