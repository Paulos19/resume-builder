"use client";

import { useState, useEffect } from "react";
import { Skill } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SkillFormProps {
  resumeId: string;
  initialData?: Skill | null;
  onSave: (data: Skill) => void;
  onCancel?: () => void;
}

export default function SkillForm({
  resumeId,
  initialData,
  onSave,
  onCancel,
}: SkillFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [level, setLevel] = useState(initialData?.level || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setLevel(initialData.level || "");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const dataToSave = {
      name,
      level,
    };

    try {
      const method = initialData ? "PUT" : "POST";
      const url = initialData
        ? `/api/resumes/${resumeId}/skills/${initialData.id}`
        : `/api/resumes/${resumeId}/skills`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar habilidade");
      }

      const savedData: Skill = await response.json();
      onSave(savedData);
      setSuccess("Habilidade salva com sucesso!");
    } catch (err: unknown) {
      setError(err.message);
      console.error("Erro ao salvar habilidade:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <div>
        <Label htmlFor="name">Nome da Habilidade</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="level">Nível (ex: Básico, Intermediário, Avançado)</Label>
        <Input
          type="text"
          id="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        />
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading} className="flex-grow">
          {loading ? "Salvando..." : "Salvar Habilidade"}
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
