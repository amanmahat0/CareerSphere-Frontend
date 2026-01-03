import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Header from "../../Components/Header";
import { api } from "../../utils/api";

const InstitutionLogin = () => {
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

    // Check for hardcoded admin credentials
    const ADMIN_EMAIL = "admin@careersphere.com";
    const ADMIN_PASSWORD = "Admin@123";

    if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
      // Admin login
      const adminUser = {
        id: "admin",
        fullname: "Admin User",
        email: ADMIN_EMAIL,
        userType: "admin",
      };

      localStorage.setItem("token", "admin-token-" + Date.now());
      localStorage.setItem("user", JSON.stringify(adminUser));
      localStorage.setItem("userType", "admin");
      localStorage.setItem("isAdmin", "true");

      navigate("/admin-dashboard", { replace: true });
      return;
    }

    try {
      const response = await api.login(formData.email, formData.password);
      
      // Check if user type matches (institution only)
      if (response.user.userType !== "institution") {
        setError(`This account is registered as an ${response.user.userType}. Please use the applicant login page.`);
        setLoading(false);
        return;
      }
      
      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("userType", "institution");
      localStorage.setItem("isAdmin", "false");
      
      // Navigate to institution dashboard
      navigate("/institution-dashboard", { replace: true });
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9ff]">
      <Header />

      {/* Login Card */}
      <div className="flex justify-center items-center py-20 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 relative">
          {/* Back Button */}
          <button
            onClick={() => navigate("/login")}
            className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold">Institution Login</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your institution account
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
                  placeholder="institution@example.com"
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
                onClick={() => navigate("/institution-forgot-password")}
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

          {/* Sign up */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/institution-signup")}
              className="text-blue-600 hover:underline"
            >
              Sign up
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

export default InstitutionLogin;

