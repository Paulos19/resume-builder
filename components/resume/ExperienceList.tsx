"use client";

import { useState } from "react";
import { Experience } from "@prisma/client";
import ExperienceForm from "./ExperienceForm";

interface ExperienceListProps {
  resumeId: string;
  initialExperiences: Experience[];
}

export default function ExperienceList({
  resumeId,
  initialExperiences,
}: ExperienceListProps) {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (newExperience: Experience) => {
    if (editingExperience) {
      setExperiences(experiences.map((exp: Experience) =>
        exp.id === newExperience.id ? newExperience : exp
      ));
      setEditingExperience(null);
    } else {
      setExperiences([...experiences, newExperience]);
    }
    setShowForm(false);
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setShowForm(true);
  };

  const handleDelete = async (experienceId: string) => {
    if (!confirm("Tem certeza de que deseja excluir esta experiência?")) return;

    try {
      const response = await fetch(
        `/api/resumes/${resumeId}/experiences/${experienceId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao excluir experiência");
      }

      setExperiences(experiences.filter((exp) => exp.id !== experienceId));
    } catch (err: unknown) {
      console.error("Erro ao excluir experiência:", err);
      alert(`Erro ao excluir experiência: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setEditingExperience(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Suas Experiências</h3>
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Adicionar Nova Experiência
        </button>
      )}

      {showForm && (
        <ExperienceForm
          resumeId={resumeId}
          initialData={editingExperience}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="space-y-2">
        {experiences.length === 0 && <p className="text-foreground">Nenhuma experiência adicionada ainda.</p>}
        {experiences.map((exp: Experience) => (
          <div key={exp.id} className="p-4 border border-border rounded-md bg-card flex justify-between items-center">
            <div>
              <p className="font-medium text-card-foreground">{exp.title} em {exp.company}</p>
              <p className="text-sm text-muted-foreground">{new Date(exp.startDate).toDateString()} - {exp.endDate ? new Date(exp.endDate).toDateString() : "Presente"}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(exp)}
                className="text-primary hover:underline text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(exp.id)}
                className="text-destructive hover:underline text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
