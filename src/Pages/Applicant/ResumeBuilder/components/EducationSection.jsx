import React, { useState, memo } from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { Card } from "../../../../ui/card";
import { ArrowLeft, ArrowRight, Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "../../../../utils/api";

const _EducationSection = ({ data, onChange, onNext, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addEducation = () => {
    onChange([
      ...data,
      { id: Date.now(), degree: "", institution: "", year: "", cgpa: "" },
    ]);
    setError("");
  };

  const removeEducation = (id) => {
    // Only remove if there's more than 1 entry AND at least one will remain valid
    const remainingEducation = data.filter((edu) => edu.id !== id);
    
    // Don't allow deleting if it leaves no entries at all
    if (remainingEducation.length > 0) {
      onChange(remainingEducation);
      setError("");
    } else {
      // Reset to single empty entry if trying to remove last one
      onChange([{ id: Date.now(), degree: "", institution: "", year: "", cgpa: "" }]);
      setError("You must have at least one education entry. Entry reset to empty.");
    }
  };

  const updateEducation = (id, field, value) => {
    onChange(
      data.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
    setError("");
  };

  // Validation: At least one education entry with degree and institution
  const isFormValid = () => {
    return data.length > 0 && data.some((edu) => (edu.degree || "").trim() && (edu.institution || "").trim());
  };

  // Handle next with database save
  const handleNext = async () => {
    if (!isFormValid()) {
      setError("Please fill in at least one education entry with both degree and institution before proceeding.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Save education to database (only new entries not already saved)
      const filledEducation = data.filter((edu) => (edu.degree || "").trim() && (edu.institution || "").trim());
      
      if (filledEducation.length === 0) {
        setError("No valid education entries to save. Please fill in degree and institution.");
        setLoading(false);
        return;
      }

      let saveFailed = false;
      
      for (const edu of filledEducation) {
        try {
          await api.addEducation({
            degree: edu.degree,
            institution: edu.institution,
            year: edu.year || "",
            cgpa: edu.cgpa || "",
          });
        } catch (entryError) {
          console.error("Failed to save education entry:", entryError);
          saveFailed = true;
          setError(`Failed to save education: ${entryError.message || "Connection error"}`);
          break;
        }
      }

      if (!saveFailed) {
        onNext();
      }
    } catch (err) {
      console.error("Error saving education:", err);
      setError(err.message || "Failed to save education. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Education</h3>
          <p className="text-sm text-slate-500">Add your educational background (required)</p>
        </div>
        <Button size="sm" variant="outline" onClick={addEducation} disabled={loading}>
          <Plus className="w-4 h-4 mr-1" />
          Add Education
        </Button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {data.map((edu, index) => (
          <Card key={edu.id} className="p-4 bg-slate-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Education #{index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeEducation(edu.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  disabled={loading}
                  title={data.length === 1 ? "Keep at least one entry" : "Remove this entry"}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <Label>Degree/Program <span className="text-red-500">*</span></Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                  placeholder="e.g., Bachelor of Engineering in Computer Science"
                  disabled={loading}
                  className={!edu.degree && error ? "border-red-500" : ""}
                />
                {!edu.degree && error && <p className="text-xs text-red-500 mt-1">Required</p>}
              </div>
              <div>
                <Label>Institution <span className="text-red-500">*</span></Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                  placeholder="e.g., University Name"
                  disabled={loading}
                  className={!edu.institution && error ? "border-red-500" : ""}
                />
                {!edu.institution && error && <p className="text-xs text-red-500 mt-1">Required</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Year</Label>
                  <Input
                    value={edu.year}
                    onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                    placeholder="e.g., 2021 - 2025"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>CGPA/Percentage</Label>
                  <Input
                    value={edu.cgpa}
                    onChange={(e) => updateEducation(edu.id, "cgpa", e.target.value)}
                    placeholder="e.g., 3.65"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
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
              Next: Experience
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const EducationSection = memo(_EducationSection);
EducationSection.displayName = "EducationSection";
export default EducationSection;
