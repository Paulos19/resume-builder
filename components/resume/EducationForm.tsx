"use client";

import { useState, useEffect } from "react";
import { Education } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EducationFormProps {
  resumeId: string;
  initialData?: Education | null;
  onSave: (data: Education) => void;
  onCancel?: () => void;
}

export default function EducationForm({
  resumeId,
  initialData,
  onSave,
  onCancel,
}: EducationFormProps) {
  const [institution, setInstitution] = useState(initialData?.institution || "");
  const [degree, setDegree] = useState(initialData?.degree || "");
  const [fieldOfStudy, setFieldOfStudy] = useState(initialData?.fieldOfStudy || "");
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : ""
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setInstitution(initialData.institution || "");
      setDegree(initialData.degree || "");
      setFieldOfStudy(initialData.fieldOfStudy || "");
      setStartDate(
        initialData.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : ""
      );
      setEndDate(
        initialData.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : ""
      );
      setDescription(initialData.description || "");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const dataToSave = {
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate: endDate || null,
      description,
    };

    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/resumes/${resumeId}/educations/${initialData.id}`
        : `/api/resumes/${resumeId}/educations`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar educação");
      }

      const savedData: Education = await response.json();
      onSave(savedData);
      setSuccess("Educação salva com sucesso!");
    } catch (err: unknown) {
      setError(err.message);
      console.error("Erro ao salvar educação:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <div>
        <Label htmlFor="institution">Instituição</Label>
        <Input
          type="text"
          id="institution"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="degree">Grau</Label>
        <Input
          type="text"
          id="degree"
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="fieldOfStudy">Área de Estudo</Label>
        <Input
          type="text"
          id="fieldOfStudy"
          value={fieldOfStudy}
          onChange={(e) => setFieldOfStudy(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="startDate">Data de Início</Label>
        <Input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="endDate">Data de Término (Deixe em branco se for atual)</Label>
        <Input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
        />
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading} className="flex-grow">
          {loading ? "Salvando..." : "Salvar Educação"}
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline" className="flex-grow">
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
