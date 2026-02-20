import React, { useState } from "react";
import { Input } from "../../../../ui/input";
import { Button } from "../../../../ui/button";
import { ArrowLeft, ArrowRight, Plus, Trash2, X } from "lucide-react";

const SkillsSection = ({ data, onChange, onNext, onBack }) => {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      onChange([...data, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const suggestedSkills = [
    "JavaScript", "React", "Node.js", "Python", "Java", "TypeScript",
    "HTML/CSS", "MongoDB", "SQL", "Git", "AWS", "Docker"
  ];

  const addSuggestedSkill = (skill) => {
    if (!data.includes(skill)) {
      onChange([...data, skill]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Skills</h3>
        <p className="text-sm text-slate-500">Add your technical and professional skills</p>
      </div>

      <div className="space-y-4">
        {/* Skill Input */}
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a skill and press Enter"
            className="flex-1"
          />
          <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Added Skills */}
        {data.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Your Skills</label>
            <div className="flex flex-wrap gap-2">
              {data.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm group"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(index)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
            {suggestedSkills
              .filter((skill) => !data.includes(skill))
              .map((skill, index) => (
                <button
                  key={index}
                  onClick={() => addSuggestedSkill(skill)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {skill}
                </button>
              ))}
          </div>
        </div>

        {data.length === 0 && (
          <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
            Please add at least one skill to continue.
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white">
          Next: Projects
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SkillsSection;
