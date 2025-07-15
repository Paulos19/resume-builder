"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResumeImporterProps {
  onImportSuccess: (data: any) => void;
}

export default function ResumeImporter({ onImportSuccess }: ResumeImporterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null);
      setSuccess(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Por favor, selecione um arquivo para importar.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/import-resume", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Currículo importado com sucesso! Revise os campos.");
        onImportSuccess(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao importar currículo");
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao importar currículo:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Importar Currículo de Arquivo</h3>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <div>
        <Label htmlFor="resumeFile">Carregar PDF ou DOCX</Label>
        <Input
          type="file"
          id="resumeFile"
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />
      </div>

      <Button
        onClick={handleImport}
        disabled={!selectedFile || loading}
      >
        {loading ? "Importando..." : "Importar Currículo"}
      </Button>
    </div>
  );
}
