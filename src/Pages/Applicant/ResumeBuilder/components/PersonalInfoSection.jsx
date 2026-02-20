import React from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { ArrowRight } from "lucide-react";

const PersonalInfoSection = ({ data, onChange, onNext }) => {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Personal Information</h3>
        <p className="text-sm text-slate-500">Fill in your basic contact details</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+977 98XXXXXXXX"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="City, Country"
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
            />
          </div>
          <div>
            <Label htmlFor="website">Website/Portfolio</Label>
            <Input
              id="website"
              value={data.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="yourportfolio.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="summary">Professional Summary</Label>
          <textarea
            id="summary"
            rows={4}
            value={data.summary}
            onChange={(e) => handleChange("summary", e.target.value)}
            placeholder="A brief summary about yourself and your career objectives..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700 text-white">
          Next: Education
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
