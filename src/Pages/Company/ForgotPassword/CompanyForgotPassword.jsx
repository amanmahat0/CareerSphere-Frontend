import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle, Clock } from "lucide-react";
import Header from "../../../Components/Header";
import Logo from "../../../Components/Logo/Logo";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      <div className="flex items-center justify-center pt-20 pb-10 px-4">
        <div className="w-full max-w-md">
          <Logo />

          <div className="bg-slate-800 rounded-xl shadow-2xl p-8 mt-8 border border-slate-700">
            {/* Step 1: Email */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <Mail className="w-12 h-12 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center">Reset Password</h2>
                <p className="text-slate-400 text-center text-sm">Enter your email to receive a verification code</p>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-400 focus:outline-none transition"
                    />
                  </div>

                  {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Verification Code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/company/login")}
                    className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Verification Code */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <KeyRound className="w-12 h-12 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center">Verify Code</h2>
                <p className="text-slate-400 text-center text-sm">Enter the 6-digit code sent to your email</p>

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
                        className="w-12 h-12 text-center text-2xl font-bold rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-400 focus:outline-none transition"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Time remaining: {formatTime(timeLeft)}</span>
                  </div>

                  {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-slate-400 hover:text-white text-sm transition"
                  >
                    Back to Email
                  </button>
                </form>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <Lock className="w-12 h-12 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center">Set New Password</h2>
                <p className="text-slate-400 text-center text-sm">Enter your new password</p>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-400 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-400 focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full text-slate-400 hover:text-white text-sm transition"
                  >
                    Back to Verification
                  </button>
                </form>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Password Reset Successful!</h2>
                <p className="text-slate-400">Your password has been successfully reset. You can now log in with your new password.</p>

                <button
                  onClick={() => navigate("/company/login", { replace: true })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyForgotPassword;