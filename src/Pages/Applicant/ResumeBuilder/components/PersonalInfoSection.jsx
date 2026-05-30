import React, { useState, memo, useMemo } from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "../../../../utils/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d][\d\s\-()]{6,18}$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

const _PersonalInfoSection = ({ data, onChange, onNext }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
    setError("");
  };

  // Function to count words
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = countWords(data.summary || "");
  const maxWords = 50;

  // Per-field validation with format checks
  const fieldErrors = useMemo(() => {
    const e = {};
    if (!data.name?.trim()) e.name = "Full name is required";

    if (!data.email?.trim()) e.email = "Email is required";
    else if (!EMAIL_RE.test(data.email.trim())) e.email = "Enter a valid email address";

    if (!data.phone?.trim()) e.phone = "Phone is required";
    else if (!PHONE_RE.test(data.phone.trim())) e.phone = "Enter a valid phone number";

    if (data.linkedin?.trim() && !URL_RE.test(data.linkedin.trim()))
      e.linkedin = "Enter a valid URL (e.g. linkedin.com/in/you)";
    if (data.website?.trim() && !URL_RE.test(data.website.trim()))
      e.website = "Enter a valid URL";

    if (!data.summary?.trim()) e.summary = "Professional summary is required";
    else if (wordCount > maxWords) e.summary = `Summary exceeds ${maxWords} words (currently ${wordCount})`;

    return e;
  }, [data, wordCount]);

  const isFormValid = () => Object.keys(fieldErrors).length === 0;

  // Show format errors live (when the field has a value); show "required" errors only after a submit attempt.
  const showErr = (field) => {
    const err = fieldErrors[field];
    if (!err) return null;
    if (submitted) return err;
    if (data[field]?.toString().trim() && !err.toLowerCase().includes("required")) return err;
    return null;
  };

  // Handle next with database save
  const handleNext = async () => {
    setSubmitted(true);
    if (!isFormValid()) {
      setError("Please fill all required fields with valid data.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.updatePersonalInfo(data);
      if (response.success) {
        // Call onNext to proceed to next step
        onNext();
      } else {
        setError(response.message || "Failed to save personal information");
      }
    } catch (err) {
      console.error("Error saving personal info:", err);
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Personal Information</h3>
        <p className="text-sm text-slate-500">Fill in your basic contact details and professional summary</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="required">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter your full name"
              disabled={loading}
              className={showErr("name") ? "border-red-500" : ""}
            />
            {showErr("name") && <p className="text-xs text-red-500 mt-1">{showErr("name")}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="required">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="your.email@example.com"
              disabled={loading}
              className={showErr("email") ? "border-red-500" : ""}
            />
            {showErr("email") && <p className="text-xs text-red-500 mt-1">{showErr("email")}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone" className="required">
              Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+977 98XXXXXXXX"
              disabled={loading}
              className={showErr("phone") ? "border-red-500" : ""}
            />
            {showErr("phone") && <p className="text-xs text-red-500 mt-1">{showErr("phone")}</p>}
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="City, Country"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={data.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              placeholder="linkedin.com/in/yourprofile"
              disabled={loading}
              className={showErr("linkedin") ? "border-red-500" : ""}
            />
            {showErr("linkedin") && <p className="text-xs text-red-500 mt-1">{showErr("linkedin")}</p>}
          </div>
          <div>
            <Label htmlFor="website">Website/Portfolio</Label>
            <Input
              id="website"
              value={data.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="yourportfolio.com"
              disabled={loading}
              className={showErr("website") ? "border-red-500" : ""}
            />
            {showErr("website") && <p className="text-xs text-red-500 mt-1">{showErr("website")}</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="summary" className="required">
              Professional Summary <span className="text-red-500">*</span>
            </Label>
            <span className={`text-xs font-medium ${wordCount > maxWords ? 'text-red-600' : wordCount > 40 ? 'text-yellow-600' : 'text-slate-500'}`}>
              {wordCount}/{maxWords} words
            </span>
          </div>
          <textarea
            id="summary"
            rows={4}
            value={data.summary}
            onChange={(e) => handleChange("summary", e.target.value)}
            placeholder="Write a brief professional summary (max 50 words)."
            disabled={loading}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-colors ${
              showErr("summary")
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500"
            } disabled:bg-slate-100 disabled:cursor-not-allowed`}
          />
          <div className="mt-2 space-y-1">
            {showErr("summary") && (
              <p className="text-xs text-red-600 font-medium">{showErr("summary")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button 
          onClick={handleNext}
          disabled={loading || !isFormValid()}
          className={`text-white ${
            isFormValid() && !loading
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          } transition-colors`}
          title={!isFormValid() ? "Please fill all required fields" : ""}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: Education
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const PersonalInfoSection = memo(_PersonalInfoSection);
PersonalInfoSection.displayName = "PersonalInfoSection";
export default PersonalInfoSection;
