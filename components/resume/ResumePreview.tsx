
"use client";

import { PersonalInfo, Experience, Education, Skill, Resume } from "@prisma/client";
import ResumeHtmlTemplate from "./ResumeHtmlTemplate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResumePreviewProps {
  resume: (Resume & {
    personalInfo: PersonalInfo | null;
    experiences: Experience[];
    educations: Education[];
    skills: Skill[];
  }) | null;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
}

export default function ResumePreview({
  resume,
  selectedTemplate,
  setSelectedTemplate,
}: ResumePreviewProps) {
  if (!resume) {
    return <div className="p-4 text-center text-gray-500">Nenhum dado de currículo para exibir.</div>;
  }

  return (
    <div className="bg-white p-8 shadow-lg rounded-lg max-w-3xl mx-auto my-8">
      <div className="mb-4 flex items-center space-x-2">
        <label htmlFor="template-select" className="text-sm font-medium text-gray-700">Selecione o Template:</label>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione um template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ModernTemplate">Template Moderno</SelectItem>
            <SelectItem value="ClassicTemplate">Template Clássico</SelectItem>
            <SelectItem value="ElegantTemplate">Template Elegante</SelectItem>
            <SelectItem value="CreativeTemplate">Template Criativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ResumeHtmlTemplate resume={resume} templateName={selectedTemplate} />
    </div>
  );
}
