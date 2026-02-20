import React from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { Card } from "../../../../ui/card";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

const EducationSection = ({ data, onChange, onNext, onBack }) => {
  const addEducation = () => {
    onChange([
      ...data,
      { id: Date.now(), degree: "", institution: "", year: "", cgpa: "" },
    ]);
  };

  const removeEducation = (id) => {
    if (data.length > 1) {
      onChange(data.filter((edu) => edu.id !== id));
    }
  };

  const updateEducation = (id, field, value) => {
    onChange(
      data.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Education</h3>
          <p className="text-sm text-slate-500">Add your educational background</p>
        </div>
        <Button size="sm" variant="outline" onClick={addEducation}>
          <Plus className="w-4 h-4 mr-1" />
          Add Education
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((edu, index) => (
          <Card key={edu.id} className="p-4 bg-slate-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Education #{index + 1}</span>
                {data.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeEducation(edu.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div>
                <Label>Degree/Program *</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                  placeholder="e.g., Bachelor of Engineering in Computer Science"
                />
              </div>
              <div>
                <Label>Institution *</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                  placeholder="e.g., University Name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Year</Label>
                  <Input
                    value={edu.year}
                    onChange={(e) => updateEducation(edu.id, "year", e.target.value)}
                    placeholder="e.g., 2021 - 2025"
                  />
                </div>
                <div>
                  <Label>CGPA/Percentage</Label>
                  <Input
                    value={edu.cgpa}
                    onChange={(e) => updateEducation(edu.id, "cgpa", e.target.value)}
                    placeholder="e.g., 3.65"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-slate-200">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white">
          Next: Experience
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default EducationSection;
