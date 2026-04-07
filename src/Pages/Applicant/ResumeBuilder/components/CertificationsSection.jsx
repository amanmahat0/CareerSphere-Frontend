import React, { useState, memo } from "react";
import { Input } from "../../../../ui/input";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { Card } from "../../../../ui/card";
import { ArrowLeft, Plus, Trash2, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "../../../../utils/api";

const _CertificationsSection = ({ data, onChange, onBack, onFinish }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addCertification = () => {
    onChange([
      ...data,
      { id: Date.now(), title: "", issuer: "", date: "", credentialId: "" },
    ]);
    setError("");
  };

  const removeCertification = (id) => {
    onChange(data.filter((cert) => cert.id !== id));
    setError("");
  };

  const updateCertification = (id, field, value) => {
    onChange(
      data.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert))
    );
    setError("");
  };

  // Validation: This section is completely optional
  const isFormValid = () => {
    return true; // Always valid - section is optional
  };

  // Handle finish with database save
  const handleFinish = async () => {
    // No validation needed - section is optional
    setLoading(true);
    setError("");

    try {
      // Save only filled certification entries to database
      const filledCertifications = data.filter((cert) => (cert.title || "").trim() && (cert.issuer || "").trim());
      
      let saveFailed = false;
      
      for (const cert of filledCertifications) {
        try {
          await api.addCertification({
            title: cert.title,
            issuer: cert.issuer,
            date: cert.date || "",
            credentialId: cert.credentialId || "",
          });
        } catch (entryError) {
          console.error("Failed to save certification entry:", entryError);
          saveFailed = true;
          setError(`Failed to save certification: ${entryError.message || "Connection error"}`);
          break;
        }
      }

      if (!saveFailed) {
        onFinish();
      }
    } catch (err) {
      console.error("Error saving certifications:", err);
      // Don't block progression for optional section
      onFinish();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Certifications</h3>
          <p className="text-sm text-slate-500">Add any professional certifications you have (optional)</p>
        </div>
        <Button size="sm" variant="outline" onClick={addCertification} disabled={loading}>
          <Plus className="w-4 h-4 mr-1" />
          Add Certification
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
            <p className="text-slate-500 mb-4">No certifications added yet. Certifications can boost your profile! (Optional)</p>
            <Button variant="outline" onClick={addCertification} disabled={loading}>
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
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div>
                  <Label>Certification Name</Label>
                  <Input
                    value={cert.title}
                    onChange={(e) => updateCertification(cert.id, "title", e.target.value)}
                    placeholder="e.g., AWS Certified Developer"
                    disabled={loading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Issuing Organization</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                      placeholder="e.g., Amazon Web Services"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label>Date (optional)</Label>
                    <Input
                      value={cert.date}
                      onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                      placeholder="e.g., 2024"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <Label>Credential ID (optional)</Label>
                  <Input
                    value={cert.credentialId || ""}
                    onChange={(e) => updateCertification(cert.id, "credentialId", e.target.value)}
                    placeholder="e.g., ABC123XYZ"
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
          onClick={handleFinish}
          disabled={loading}
          className="text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Finish & Preview
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const CertificationsSection = memo(_CertificationsSection);
CertificationsSection.displayName = "CertificationsSection";
export default CertificationsSection;
