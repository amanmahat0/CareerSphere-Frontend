import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle, Clock, GraduationCap } from "lucide-react";
import Header from "../../../Components/Header";
import { api } from "../../../utils/api";

const CompanyForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password, 4: success
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Timer for code expiry
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && step === 2) {
      setError("Verification code expired. Please request a new one.");
    }
  }, [timeLeft, step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }

    try {
      await api.forgotPassword(email, "institution");
      setFullname("Company");
      setStep(2);
      setTimeLeft(300); // Reset timer
    } catch (error) {
      setError(error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const codeString = code.join("");
    if (codeString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      setLoading(false);
      return;
    }

    try {
      await api.verifyCode(email, codeString, "institution");
      setStep(3);
    } catch (error) {
      setError(error.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!password || !confirmPassword) {
      setError("Please enter both password fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await api.resetPassword(email, password, "institution");
      setStep(4);
    } catch (error) {
      setError(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9ff]" style={{
      backgroundImage: 'url("/images/bg-skyline.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'bottom',
      backgroundAttachment: 'fixed'
    }}>
      <Header />
      <div className="flex justify-center items-center py-20 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold">Careersphere</span>
            </div>
          </div>
          {/* Step 1: Email */}
          {step === 1 && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => navigate("/company/login")}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>

              <div className="flex items-center justify-center mb-4">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-center">Reset Password</h2>
              <p className="text-gray-500 text-center text-sm">Enter your email to receive a verification code</p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1f3a8a] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#1a2f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Verification Code */}
          {step === 2 && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Email
              </button>

              <div className="flex items-center justify-center mb-4">
                <KeyRound className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-center">Verify Code</h2>
              <p className="text-gray-500 text-center text-sm">Enter the 6-digit code sent to your email</p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-12 h-12 text-center text-2xl font-bold rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Time remaining: {formatTime(timeLeft)}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1f3a8a] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#1a2f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </form>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Verification
              </button>

              <div className="flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-center">Set New Password</h2>
              <p className="text-gray-500 text-center text-sm">Enter your new password</p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1f3a8a] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#1a2f73] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold">Password Reset Successful!</h2>
              <p className="text-gray-500">Your password has been successfully reset. You can now log in with your new password.</p>

              <button
                onClick={() => navigate("/company/login", { replace: true })}
                className="w-full bg-[#1f3a8a] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#1a2f73] transition-colors"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyForgotPassword;