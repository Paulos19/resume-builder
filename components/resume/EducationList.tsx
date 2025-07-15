"use client";

import { useState } from "react";
import { Education } from "@prisma/client";
import EducationForm from "./EducationForm";

interface EducationListProps {
  resumeId: string;
  initialEducations: Education[];
}

export default function EducationList({
  resumeId,
  initialEducations,
}: EducationListProps) {
  const [educations, setEducations] = useState<Education[]>(initialEducations);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (newEducation: Education) => {
    if (editingEducation) {
      setEducations(educations.map((edu: Education) =>
        edu.id === newEducation.id ? newEducation : edu
      ));
      setEditingEducation(null);
    } else {
      setEducations([...educations, newEducation]);
    }
    setShowForm(false);
  };

  const handleEdit = (education: Education) => {
    setEditingEducation(education);
    setShowForm(true);
  };

  const handleDelete = async (educationId: string) => {
    if (!confirm("Tem certeza de que deseja excluir esta entrada de educação?")) return;

    try {
      const response = await fetch(
        `/api/resumes/${resumeId}/educations/${educationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao excluir entrada de educação");
      }

      setEducations(educations.filter((edu) => edu.id !== educationId));
    } catch (err: unknown) {
      console.error("Erro ao excluir entrada de educação:", err);
      alert(`Erro ao excluir entrada de educação: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setEditingEducation(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sua Educação</h3>
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Adicionar Nova Educação
        </button>
      )}

      {showForm && (
        <EducationForm
          resumeId={resumeId}
          initialData={editingEducation}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="space-y-2">
        {educations.length === 0 && <p className="text-foreground">Nenhuma entrada de educação adicionada ainda.</p>}
        {educations.map((edu: Education) => (
          <div key={edu.id} className="p-4 border border-border rounded-md bg-card flex justify-between items-center">
            <div>
              <p className="font-medium text-card-foreground">{edu.degree} em {edu.fieldOfStudy} de {edu.institution}</p>
              <p className="text-sm text-muted-foreground">{new Date(edu.startDate).toDateString()} - {edu.endDate ? new Date(edu.endDate).toDateString() : "Presente"}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(edu)}
                className="text-primary hover:underline text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(edu.id)}
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
