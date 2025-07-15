
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import PersonalInfoForm from "@/components/resume/PersonalInfoForm";
import ExperienceList from "@/components/resume/ExperienceList";
import EducationList from "@/components/resume/EducationList";
import SkillList from "@/components/resume/SkillList";
import ResumePreview from "@/components/resume/ResumePreview";
import ResumeImporter from "@/components/resume/ResumeImporter";

// Define local interfaces for Prisma models to avoid direct import in client component
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

export default function ResumeBuilderPage() {
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState("personalInfo");
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingResume, setLoadingResume] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("ModernTemplate");

  useEffect(() => {
    const fetchResumeData = async (id: string) => {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        if (!res.ok) {
          throw new Error("Falha ao buscar currículo");
        }
        const resumeData: (Resume & { personalInfo?: PersonalInfo; experiences?: Experience[]; educations?: Education[]; skills?: Skill[]; }) = await res.json();
        setCurrentResume(resumeData);
        setPersonalInfo(resumeData.personalInfo || null);
        setExperiences(resumeData.experiences || []);
        setEducations(resumeData.educations || []);
        setSkills(resumeData.skills || []);
      } catch (err: unknown) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoadingResume(false);
      }
    };

    const fetchOrCreateResume = async () => {
      if (!session?.user?.email) return;

      const urlParams = new URLSearchParams(window.location.search);
      const resumeIdFromUrl = urlParams.get('resumeId');

      if (resumeIdFromUrl) {
        await fetchResumeData(resumeIdFromUrl);
      } else {
        try {
          const res = await fetch("/api/resumes");
          if (!res.ok) {
            throw new Error("Falha ao buscar currículos");
          }
          const resumes: (Resume & { personalInfo?: PersonalInfo; experiences?: Experience[]; educations?: Education[]; skills?: Skill[]; })[] = await res.json();

          if (resumes.length > 0) {
            setCurrentResume(resumes[0]);
            setPersonalInfo(resumes[0].personalInfo || null);
            setExperiences(resumes[0].experiences || []);
            setEducations(resumes[0].educations || []);
            setSkills(resumes[0].skills || []);
          } else {
            const createRes = await fetch("/api/resumes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: "Meu Novo Currículo" }),
            });
            if (!createRes.ok) {
              throw new Error("Falha ao criar novo currículo");
            }
            const newResume: Resume = await createRes.json();
            setCurrentResume(newResume);
          }
        } catch (err: unknown) {
          setError(err.message);
          console.error(err);
        } finally {
          setLoadingResume(false);
        }
      }
    };

    if (status === "authenticated") {
      fetchOrCreateResume();
    }
  }, [session, status]);

  const handlePersonalInfoSave = (data: PersonalInfo) => {
    setPersonalInfo(data);
  };

  if (status === "loading" || loadingResume) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!session) {
    redirect("/login");
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Erro: {error}
      </div>
    );
  }

  if (!currentResume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Nenhum currículo encontrado ou criado. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">Construa seu Currículo</h2>
        {currentResume && (
          <div className="flex space-x-2">
            <a
              href={`/api/export/pdf?resumeId=${currentResume.id}&templateName=${selectedTemplate}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Exportar para PDF
            </a>
            <a
              href={`/api/export/docx?resumeId=${currentResume.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Exportar para DOCX
            </a>
          </div>
        )}
      </div>
      {/* Navigation for sections */}
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button
          onClick={() => setActiveSection("personalInfo")}
          className={`px-4 py-2 rounded-md ${activeSection === "personalInfo" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          Informações Pessoais
        </button>
        <button
          onClick={() => setActiveSection("experience")}
          className={`px-4 py-2 rounded-md ${activeSection === "experience" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          Experiência
        </button>
        <button
          onClick={() => setActiveSection("education")}
          className={`px-4 py-2 rounded-md ${activeSection === "education" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          Educação
        </button>
        <button
          onClick={() => setActiveSection("skills")}
          className={`px-4 py-2 rounded-md ${activeSection === "skills" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          Habilidades
        </button>
        <button
          onClick={() => setActiveSection("preview")}
          className={`px-4 py-2 rounded-md ${activeSection === "preview" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          Visualização
        </button>
        <button
          onClick={() => setActiveSection("import")}
          className={`px-4 py-2 rounded-md ${activeSection === "import" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
        >
          Importar Currículo
        </button>
      </div>

      {/* Render active section form */}
      <div>
        {activeSection === "personalInfo" && currentResume && (
          <PersonalInfoForm
            resumeId={currentResume.id}
            initialData={personalInfo}
            onSave={handlePersonalInfoSave}
            skills={skills}
            experiences={experiences}
            educations={educations}
          />
        )}
        {activeSection === "experience" && currentResume && (
          <ExperienceList
            resumeId={currentResume.id}
            initialExperiences={experiences}
          />
        )}
        {activeSection === "education" && currentResume && (
          <EducationList
            resumeId={currentResume.id}
            initialEducations={educations}
          />
        )}
        {activeSection === "skills" && currentResume && (
          <SkillList
            resumeId={currentResume.id}
            initialSkills={skills}
          />
        )}
        {activeSection === "preview" && currentResume && (
          <ResumePreview
            resume={{
              ...currentResume,
              personalInfo,
              experiences,
              educations,
              skills,
            }}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
          />
        )}
        {activeSection === "import" && currentResume && (
          <ResumeImporter onImportSuccess={(importedData) => {
            // Logic to update forms with imported data
            setPersonalInfo(importedData.personalInfo || null);
            setExperiences(importedData.experiences || []);
            setEducations(importedData.educations || []);
            setSkills(importedData.skills || []);
            setActiveSection("personalInfo"); // Redirect to personal info after import
          }} />
        )}
      </div>
    </div>
  );
}
