"use client";

import { useState, useEffect } from "react";
import { Experience } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ExperienceFormProps {
  resumeId: string;
  initialData?: Experience | null;
  onSave: (data: Experience) => void;
  onCancel?: () => void;
}

export default function ExperienceForm({
  resumeId,
  initialData,
  onSave,
  onCancel,
}: ExperienceFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [company, setCompany] = useState(initialData?.company || "");
  const [location, setLocation] = useState(initialData?.location || "");
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
      setTitle(initialData.title || "");
      setCompany(initialData.company || "");
      setLocation(initialData.location || "");
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
      title,
      company,
      location,
      startDate,
      endDate: endDate || null,
      description,
    };

    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/resumes/${resumeId}/experiences/${initialData.id}`
        : `/api/resumes/${resumeId}/experiences`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar experiência");
      }

      const savedData: Experience = await response.json();
      onSave(savedData);
      setSuccess("Experiência salva com sucesso!");
    } catch (err: unknown) {
      setError(err.message);
      console.error("Erro ao salvar experiência:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <div>
        <Label htmlFor="title">Cargo</Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="company">Empresa</Label>
        <Input
          type="text"
          id="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="location">Localização</Label>
        <Input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
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
        <Button
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              const prompt = `Gere uma descrição de cargo concisa para um currículo para a função de ${title} na ${company}. Concentre-se nas principais responsabilidades e conquistas. Não use negrito.`;
              const response = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
              });
              const data = await response.json();
              setDescription(data.text);
            } catch (err) {
              setError("Falha ao gerar descrição com IA.");
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="mt-2"
        >
          {loading ? "Gerando..." : "Gerar com IA"}
        </Button>
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading} className="flex-grow">
          {loading ? "Salvando..." : "Salvar Experiência"}
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
