import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff, CheckCircle, Clock } from "lucide-react";
import Header from "../../Components/Header";
import Logo from "../../Components/Logo/Logo";
import { api } from "../../utils/api";

const InstitutionForgotPassword = () => {
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
      setFullname("Institution");
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
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
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
    <div className="min-h-screen bg-[#f6f9ff]">
      <Header />

      <div className="flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Logo />
              <h1 className="text-2xl font-bold">CareerSphere</h1>
            </div>
            <p className="text-center text-blue-100 text-sm">Password Recovery</p>
          </div>

          {/* Content */}
          <div className="p-8 relative">
            {/* Back Button */}
            {step < 4 && (
              <button
                onClick={() => {
                  if (step === 1) {
                    navigate("/institution-login");
                  } else {
                    setStep(step - 1);
                    setError("");
                  }
                }}
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <>
                <div className="flex flex-col items-center text-center mb-8 mt-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="text-blue-600 w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Recover Your Account</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Enter your email address and we'll send you a verification code
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleEmailSubmit}>
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        placeholder="institution@example.com"
                        className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending Code..." : "Send Verification Code"}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: 6-Digit Code */}
            {step === 2 && (
              <>
                <div className="flex flex-col items-center text-center mb-8 mt-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <KeyRound className="text-blue-600 w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Enter Verification Code</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    We sent a 6-digit code to <br />
                    <span className="font-semibold text-gray-900">{email}</span>
                  </p>
                </div>

                {/* Timer */}
                <div
                  className={`mb-6 p-3 rounded-lg flex items-center justify-center gap-2 ${
                    timeLeft < 60
                      ? "bg-red-50 border border-red-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <Clock className={`w-4 h-4 ${timeLeft < 60 ? "text-red-600" : "text-blue-600"}`} />
                  <span className={`text-sm font-semibold ${timeLeft < 60 ? "text-red-600" : "text-blue-600"}`}>
                    Code expires in: {formatTime(timeLeft)}
                  </span>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCodeSubmit}>
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 block mb-3">
                      Verification Code
                    </label>
                    <div className="flex gap-2 justify-center">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          id={`code-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || timeLeft === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </form>

                <p className="text-center text-xs text-gray-600 mt-4">
                  Didn't receive the code?{" "}
                  <button
                    onClick={() => {
                      setStep(1);
                      setError("");
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Try again
                  </button>
                </p>
              </>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <>
                <div className="flex flex-col items-center text-center mb-8 mt-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="text-blue-600 w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Create a strong new password for your institution account
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700">New Password</label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter new password"
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
                    <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="Confirm new password"
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <>
                <div className="flex flex-col items-center text-center mb-8 mt-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="text-green-600 w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Password Reset Successful!</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Your password has been successfully changed. You can now login with your new password.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-700">
                    ✓ Your institution account is now secure with the new password.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/institution-login")}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionForgotPassword;


