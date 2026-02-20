import React from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { Card } from "../../../../ui/card";
import { ArrowLeft, Plus, Trash2, CheckCircle } from "lucide-react";

const CertificationsSection = ({ data, onChange, onBack, onFinish }) => {
  const addCertification = () => {
    onChange([
      ...data,
      { id: Date.now(), name: "", issuer: "", year: "", credentialId: "" },
    ]);
  };

  const removeCertification = (id) => {
    onChange(data.filter((cert) => cert.id !== id));
  };

  const updateCertification = (id, field, value) => {
    onChange(
      data.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Certifications</h3>
          <p className="text-sm text-slate-500">Add any professional certifications you have</p>
        </div>
        <Button size="sm" variant="outline" onClick={addCertification}>
          <Plus className="w-4 h-4 mr-1" />
          Add Certification
        </Button>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <Card className="p-8 bg-slate-50 text-center">
            <p className="text-slate-500 mb-4">No certifications added yet. Certifications can boost your profile!</p>
            <Button variant="outline" onClick={addCertification}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Certification
            </Button>
          </Card>
        ) : (
          data.map((cert, index) => (
            <Card key={cert.id} className="p-4 bg-slate-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Certification #{index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCertification(cert.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <Label>Certification Name</Label>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                    placeholder="e.g., AWS Certified Developer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Issuing Organization</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      value={cert.year}
                      onChange={(e) => updateCertification(cert.id, "year", e.target.value)}
                      placeholder="e.g., 2024"
                    />
                  </div>
                </div>
                <div>
                  <Label>Credential ID (optional)</Label>
                  <Input
                    value={cert.credentialId || ""}
                    onChange={(e) => updateCertification(cert.id, "credentialId", e.target.value)}
                    placeholder="e.g., ABC123XYZ"
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
        <Button onClick={onFinish} className="bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle className="w-4 h-4 mr-2" />
          Finish & Preview
        </Button>
      </div>
    </div>
  );
};

export default CertificationsSection;
