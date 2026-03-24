import React, { useState, memo, useCallback, useMemo } from "react";
import { Input } from "../../../../ui/input";
import { Button } from "../../../../ui/button";
import { ArrowLeft, ArrowRight, Plus, Trash2, X, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "../../../../utils/api";

const _SkillsSection = ({ data, onChange, onNext, onBack }) => {
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      onChange([...data, newSkill.trim()]);
      setNewSkill("");
      setError("");
    }
  };

  const removeSkill = (index) => {
    onChange(data.filter((_, i) => i !== index));
    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // Validation: At least one skill required
  const isFormValid = () => {
    return data.length > 0;
  };

  // Handle next with database save
  const handleNext = async () => {
    if (!isFormValid()) {
      setError("Please add at least one skill.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Save skills to database
      await api.request("/resume/skills", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: { skills: data },
      });
      onNext();
    } catch (err) {
      console.error("Error saving skills:", err);
      setError(err.message || "Failed to save skills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const suggestedSkills = useMemo(() => [
    "JavaScript", "React", "Node.js", "Python", "Java", "TypeScript",
    "HTML/CSS", "MongoDB", "SQL", "Git", "AWS", "Docker"
  ], []);

  // Memoize filtered suggested skills
  const availableSuggestions = useMemo(() => 
    suggestedSkills.filter((skill) => !data.includes(skill)),
    [suggestedSkills, data]
  );

  const addSuggestedSkill = (skill) => {
    if (!data.includes(skill)) {
      onChange([...data, skill]);
      setError("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Skills</h3>
        <p className="text-sm text-slate-500">Add your technical and professional skills (required)</p>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Skill Input */}
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a skill and press Enter"
            className="flex-1"
            disabled={loading}
          />
          <Button 
            onClick={addSkill} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Added Skills */}
        {data.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Your Skills ({data.length})</label>
            <div className="flex flex-wrap gap-2">
              {data.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm group"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(index)}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Skills */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Suggested Skills</label>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => addSuggestedSkill(skill)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  <Plus className="w-3 h-3" />
                  {skill}
                </button>
              ))}
          </div>
        </div>

        {data.length === 0 && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg font-medium">
            ✗ Please add at least one skill to continue.
          </p>
        )}
        
        {data.length > 0 && (
          <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg font-medium">
            ✓ Great! You have {data.length} skill{data.length > 1 ? 's' : ''} added.
          </p>
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
          title={!isFormValid() ? "Please add at least one skill" : ""}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Next: Projects
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const SkillsSection = memo(_SkillsSection);

SkillsSection.displayName = "SkillsSection";

export default SkillsSection;
