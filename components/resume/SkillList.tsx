"use client";

import { useState } from "react";
import { Skill } from "@prisma/client";
import SkillForm from "./SkillForm";

interface SkillListProps {
  resumeId: string;
  initialSkills: Skill[];
}

export default function SkillList({
  resumeId,
  initialSkills,
}: SkillListProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (newSkill: Skill) => {
    if (editingSkill) {
      setSkills(skills.map((skill) =>
        skill.id === newSkill.id ? newSkill : skill
      ));
      setEditingSkill(null);
    } else {
      setSkills([...skills, newSkill]);
    }
    setShowForm(false);
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setShowForm(true);
  };

  const handleDelete = async (skillId: string) => {
    if (!confirm("Tem certeza de que deseja excluir esta habilidade?")) return;

    try {
      const response = await fetch(
        `/api/resumes/${resumeId}/skills/${skillId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao excluir habilidade");
      }

      setSkills(skills.filter((skill) => skill.id !== skillId));
    } catch (err: unknown) {
      console.error("Erro ao excluir habilidade:", err);
      alert(`Erro ao excluir habilidade: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setEditingSkill(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Suas Habilidades</h3>
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Adicionar Nova Habilidade
        </button>
      )}

      {showForm && (
        <SkillForm
          resumeId={resumeId}
          initialData={editingSkill}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="space-y-2">
        {skills.length === 0 && <p className="text-foreground">Nenhuma habilidade adicionada ainda.</p>}
        {skills.map((skill: Skill) => (
          <div key={skill.id} className="p-4 border border-border rounded-md bg-card flex justify-between items-center">
            <div>
              <p className="font-medium text-card-foreground">{skill.name} {skill.level && `(${skill.level})`}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(skill)}
                className="text-primary hover:underline text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(skill.id)}
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
