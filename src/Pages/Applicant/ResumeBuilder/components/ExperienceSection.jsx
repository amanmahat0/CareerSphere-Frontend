import React from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { Card } from "../../../../ui/card";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

const ExperienceSection = ({ data, onChange, onNext, onBack }) => {
  const addExperience = () => {
    onChange([
      ...data,
      { id: Date.now(), title: "", company: "", duration: "", description: "" },
    ]);
  };

  const removeExperience = (id) => {
    onChange(data.filter((exp) => exp.id !== id));
  };

  const updateExperience = (id, field, value) => {
    onChange(
      data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Work Experience</h3>
          <p className="text-sm text-slate-500">Add your work experience (optional for freshers)</p>
        </div>
        <Button size="sm" variant="outline" onClick={addExperience}>
          <Plus className="w-4 h-4 mr-1" />
          Add Experience
        </Button>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <Card className="p-8 bg-slate-50 text-center">
            <p className="text-slate-500 mb-4">No work experience added yet.</p>
            <Button variant="outline" onClick={addExperience}>
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
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                      placeholder="e.g., Software Developer Intern"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      placeholder="e.g., Tech Company"
                    />
                  </div>
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={exp.duration}
                    onChange={(e) => updateExperience(exp.id, "duration", e.target.value)}
                    placeholder="e.g., Jan 2024 - Present"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                    placeholder="Describe your responsibilities and achievements..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white">
          Next: Skills
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ExperienceSection;
