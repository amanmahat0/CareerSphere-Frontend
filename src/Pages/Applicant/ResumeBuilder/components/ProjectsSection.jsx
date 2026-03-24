import React, { useState, memo } from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { Card } from "../../../../ui/card";
import { ArrowLeft, ArrowRight, Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "../../../../utils/api";

const _ProjectsSection = ({ data, onChange, onNext, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addProject = () => {
    onChange([
      ...data,
      { id: Date.now(), name: "", description: "", link: "" },
    ]);
    setError("");
  };

  const removeProject = (id) => {
    onChange(data.filter((proj) => proj.id !== id));
    setError("");
  };

  const updateProject = (id, field, value) => {
    onChange(
      data.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj))
    );
    setError("");
  };

  // Validation: All entries must have name if any exist
  const isFormValid = () => {
    if (data.length === 0) return true; // Optional section
    return data.every((proj) => (proj.name || "").trim());
  };

  // Handle next with database save
  const handleNext = async () => {
    if (!isFormValid()) {
      setError("Please add a project name for all entries.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Save only filled project entries to database
      for (const proj of data) {
        if ((proj.name || "").trim()) {
          await api.request("/resume/projects", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: {
              name: proj.name,
              description: proj.description || "",
              link: proj.link || "",
            },
          });
        }
      }
      onNext();
    } catch (err) {
      console.error("Error saving projects:", err);
      setError(err.message || "Failed to save projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Projects</h3>
          <p className="text-sm text-slate-500">Showcase your best projects (optional)</p>
        </div>
        <Button size="sm" variant="outline" onClick={addProject} disabled={loading}>
          <Plus className="w-4 h-4 mr-1" />
          Add Project
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
            <p className="text-slate-500 mb-4">No projects added yet. Projects help showcase your practical skills! (Optional)</p>
            <Button variant="outline" onClick={addProject} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Project
            </Button>
          </Card>
        ) : (
          data.map((project, index) => (
            <Card key={project.id} className="p-4 bg-slate-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Project #{index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeProject(project.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <Label>Project Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={project.name}
                    onChange={(e) => updateProject(project.id, "name", e.target.value)}
                    placeholder="e.g., E-commerce Platform"
                    disabled={loading}
                    className={!project.name && error ? "border-red-500" : ""}
                  />
                  {!project.name && error && <p className="text-xs text-red-500 mt-1">Required</p>}
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    rows={3}
                    value={project.description}
                    onChange={(e) => updateProject(project.id, "description", e.target.value)}
                    placeholder="Describe the project, your role, and key features..."
                    disabled={loading}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label>Project Link (optional)</Label>
                  <Input
                    value={project.link || ""}
                    onChange={(e) => updateProject(project.id, "link", e.target.value)}
                    placeholder="e.g., github.com/username/project"
                    disabled={loading}
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
              Next: Certifications
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const ProjectsSection = memo(_ProjectsSection);
ProjectsSection.displayName = "ProjectsSection";
export default ProjectsSection;
