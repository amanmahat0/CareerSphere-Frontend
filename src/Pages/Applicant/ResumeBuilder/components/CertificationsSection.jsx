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
      { id: Date.now(), name: "", issuer: "", year: "", credentialId: "" },
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

  // Validation: All entries must have name and issuer if any exist
  const isFormValid = () => {
    if (data.length === 0) return true; // Optional section
    return data.every((cert) => (cert.name || "").trim() && (cert.issuer || "").trim());
  };

  // Handle finish with database save
  const handleFinish = async () => {
    if (!isFormValid()) {
      setError("Please add certification name and issuer for all entries.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Save only filled certification entries to database
      for (const cert of data) {
        if ((cert.name || "").trim() && (cert.issuer || "").trim()) {
          await api.request("/resume/certifications", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: {
              name: cert.name,
              issuer: cert.issuer,
              year: cert.year || "",
              credentialId: cert.credentialId || "",
            },
          });
        }
      }
      onFinish();
    } catch (err) {
      console.error("Error saving certifications:", err);
      setError(err.message || "Failed to save certifications. Please try again.");
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
                  <Label>Certification Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                    placeholder="e.g., AWS Certified Developer"
                    disabled={loading}
                    className={!cert.name && error ? "border-red-500" : ""}
                  />
                  {!cert.name && error && <p className="text-xs text-red-500 mt-1">Required</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Issuing Organization <span className="text-red-500">*</span></Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                      placeholder="e.g., Amazon Web Services"
                      disabled={loading}
                      className={!cert.issuer && error ? "border-red-500" : ""}
                    />
                    {!cert.issuer && error && <p className="text-xs text-red-500 mt-1">Required</p>}
                  </div>
                  <div>
                    <Label>Year (optional)</Label>
                    <Input
                      value={cert.year}
                      onChange={(e) => updateCertification(cert.id, "year", e.target.value)}
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
          disabled={loading || !isFormValid()}
          className={`text-white ${
            isFormValid() && !loading
              ? "bg-green-600 hover:bg-green-700 cursor-pointer"
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
