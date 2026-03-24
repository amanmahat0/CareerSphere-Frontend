import React, { useState, memo } from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { Card } from "../../../../ui/card";
import { ArrowLeft, ArrowRight, Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "../../../../utils/api";

const _ExperienceSection = ({ data, onChange, onNext, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addExperience = () => {
    onChange([
      ...data,
      { id: Date.now(), company: "", title: "", duration: "", description: "" },
    ]);
    setError("");
  };

  const removeExperience = (id) => {
    onChange(data.filter((exp) => exp.id !== id));
    setError("");
  };

  const updateExperience = (id, field, value) => {
    onChange(
      data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
    setError("");
  };

  // Validation: All entries must have company and title if any exist
  const isFormValid = () => {
    if (data.length === 0) return true; // Optional section
    return data.every((exp) => (exp.company || "").trim() && (exp.title || "").trim());
  };

  // Handle next with database save
  const handleNext = async () => {
    if (!isFormValid()) {
      setError("Please fill company and title for all experience entries. You can also skip if you're a fresher.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Save only filled experience entries to database
      const filledExperience = data.filter((exp) => (exp.company || "").trim() && (exp.title || "").trim());
      
      let saveFailed = false;
      
      for (const exp of filledExperience) {
        try {
          await api.addExperience({
            company: exp.company,
            title: exp.title,
            duration: exp.duration || "",
            description: exp.description || "",
          });
        } catch (entryError) {
          console.error("Failed to save experience entry:", entryError);
          saveFailed = true;
          setError(`Failed to save experience: ${entryError.message || "Connection error"}`);
          break;
        }
      }

      if (!saveFailed) {
        onNext();
      }
    } catch (err) {
      console.error("Error saving experience:", err);
      setError(err.message || "Failed to save experience. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Work Experience</h3>
          <p className="text-sm text-slate-500">Add your work experience (optional for freshers)</p>
        </div>
        <Button size="sm" variant="outline" onClick={addExperience} disabled={loading}>
          <Plus className="w-4 h-4 mr-1" />
          Add Experience
        </Button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {data.length === 0 ? (
          <Card className="p-8 bg-slate-50 text-center">
            <p className="text-slate-500 mb-4">No work experience added yet. (Optional for freshers)</p>
            <Button variant="outline" onClick={addExperience} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Experience
            </Button>
          </Card>
        ) : (
          data.map((exp, index) => (
            <Card key={exp.id} className="p-4 bg-slate-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Experience #{index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeExperience(exp.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Job Title <span className="text-red-500">*</span></Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                      placeholder="e.g., Software Developer Intern"
                      disabled={loading}
                      className={!exp.title && error ? "border-red-500" : ""}
                    />
                    {!exp.title && error && <p className="text-xs text-red-500 mt-1">Required</p>}
                  </div>
                  <div>
                    <Label>Company <span className="text-red-500">*</span></Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      placeholder="e.g., Tech Company"
                      disabled={loading}
                      className={!exp.company && error ? "border-red-500" : ""}
                    />
                    {!exp.company && error && <p className="text-xs text-red-500 mt-1">Required</p>}
                  </div>
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={exp.duration}
                    onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
                    placeholder="e.g., Jan 2024 - Present"
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                    placeholder="Describe your responsibilities and achievements..."
                    disabled={loading}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </Card>
          ))
        )}
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
              Next: Skills
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const ExperienceSection = memo(_ExperienceSection);
ExperienceSection.displayName = "ExperienceSection";
export default ExperienceSection;
