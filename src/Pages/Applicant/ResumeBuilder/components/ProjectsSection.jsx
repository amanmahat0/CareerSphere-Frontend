import React from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { Card } from "../../../../ui/card";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

const ProjectsSection = ({ data, onChange, onNext, onBack }) => {
  const addProject = () => {
    onChange([
      ...data,
      { id: Date.now(), name: "", description: "", technologies: [], link: "" },
    ]);
  };

  const removeProject = (id) => {
    onChange(data.filter((proj) => proj.id !== id));
  };

  const updateProject = (id, field, value) => {
    onChange(
      data.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Projects</h3>
          <p className="text-sm text-slate-500">Showcase your best projects</p>
        </div>
        <Button size="sm" variant="outline" onClick={addProject}>
          <Plus className="w-4 h-4 mr-1" />
          Add Project
        </Button>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <Card className="p-8 bg-slate-50 text-center">
            <p className="text-slate-500 mb-4">No projects added yet. Projects help showcase your practical skills!</p>
            <Button variant="outline" onClick={addProject}>
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
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <Label>Project Name</Label>
                  <Input
                    value={project.name}
                    onChange={(e) => updateProject(project.id, "name", e.target.value)}
                    placeholder="e.g., E-commerce Platform"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    rows={3}
                    value={project.description}
                    onChange={(e) => updateProject(project.id, "description", e.target.value)}
                    placeholder="Describe the project, your role, and key features..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <Label>Technologies (comma-separated)</Label>
                  <Input
                    value={project.technologies?.join(", ") || ""}
                    onChange={(e) =>
                      updateProject(
                        project.id,
                        "technologies",
                        e.target.value.split(",").map((t) => t.trim()).filter((t) => t)
                      )
                    }
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <Label>Project Link (optional)</Label>
                  <Input
                    value={project.link || ""}
                    onChange={(e) => updateProject(project.id, "link", e.target.value)}
                    placeholder="e.g., github.com/username/project"
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
          Next: Certifications
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectsSection;
