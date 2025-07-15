import React from "react";
import ModernTemplate from "./templates/ModernTemplate";
import ClassicTemplate from "./templates/ClassicTemplate";
import ElegantTemplate from "./templates/ElegantTemplate";
import CreativeTemplate from "./templates/CreativeTemplate";

interface PersonalInfo {
  id: string;
  resumeId: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  profilePicture: string | null;
  summary: string | null;
}

interface Experience {
  id: string;
  resumeId: string;
  title: string;
  company: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
}

interface Education {
  id: string;
  resumeId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
}

interface Skill {
  id: string;
  resumeId: string;
  name: string;
  level: string | null;
}

interface Resume {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TemplateProps {
  resume: (Resume & {
    personalInfo: PersonalInfo | null;
    experiences: Experience[];
    educations: Education[];
    skills: Skill[];
  }) | null;
}

interface ResumeHtmlTemplateProps {
  resume: (Resume & {
    personalInfo: PersonalInfo | null;
    experiences: Experience[];
    educations: Education[];
    skills: Skill[];
  }) | null;
  templateName?: string; // New prop for template selection
}

export default function ResumeHtmlTemplate({ resume, templateName = "ModernTemplate" }: ResumeHtmlTemplateProps) {
  if (!resume) {
    return <div>Nenhum dado de currículo para exibir.</div>;
  }

  // Map template names to components
  const templates: { [key: string]: React.ComponentType<TemplateProps> } = {
    ModernTemplate: ModernTemplate,
    ClassicTemplate: ClassicTemplate,
    ElegantTemplate: ElegantTemplate,
    CreativeTemplate: CreativeTemplate,
  };

  const SelectedTemplate = templates[templateName];

  if (!SelectedTemplate) {
    return <div>Template não encontrado.</div>;
  }

  return <SelectedTemplate resume={resume} />;
}