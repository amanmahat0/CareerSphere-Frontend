import React, { useState, memo } from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "../../../../utils/api";

const _PersonalInfoSection = ({ data, onChange, onNext }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Validation function
  const isFormValid = () => {
    return (
      data.name &&
      data.name.trim() !== "" &&
      data.email &&
      data.email.trim() !== "" &&
      data.phone &&
      data.phone.trim() !== "" &&
      data.summary &&
      data.summary.trim() !== "" &&
      wordCount > 0 &&
      wordCount <= maxWords
    );
  };

  // Handle next with database save
  const handleNext = async () => {
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
              className={!data.name && error ? "border-red-500" : ""}
            />
            {!data.name && error && <p className="text-xs text-red-500 mt-1">Required</p>}
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
              className={!data.email && error ? "border-red-500" : ""}
            />
            {!data.email && error && <p className="text-xs text-red-500 mt-1">Required</p>}
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
              className={!data.phone && error ? "border-red-500" : ""}
            />
            {!data.phone && error && <p className="text-xs text-red-500 mt-1">Required</p>}
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
            />
          </div>
          <div>
            <Label htmlFor="website">Website/Portfolio</Label>
            <Input
              id="website"
              value={data.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="yourportfolio.com"
              disabled={loading}
            />
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
              wordCount > maxWords
                ? "border-red-500 focus:ring-red-500"
                : !data.summary && error
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500"
            } disabled:bg-slate-100 disabled:cursor-not-allowed`}
          />
          <div className="mt-2 space-y-1">
            {!data.summary && error && (
              <p className="text-xs text-red-600 font-medium">✗ Professional summary is required</p>
            )}
            {data.summary && wordCount === 0 && (
              <p className="text-xs text-yellow-600">✗ Please add some summary text</p>
            )}
            {wordCount > maxWords && (
              <p className="text-xs text-red-600 font-medium"> Summary exceeds {maxWords} words. Current: {wordCount}</p>
            )}
            {data.summary && wordCount > 0 && wordCount <= maxWords && (
              <p className="text-xs text-green-600 font-medium"></p>
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
