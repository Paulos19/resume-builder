import React from "react";

// Define local interfaces for Prisma models
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

export default function ModernTemplate({ resume }: TemplateProps) {
  if (!resume) {
    return <div>Nenhum dado de currículo para exibir.</div>;
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      margin: '20px',
      maxWidth: '800px',
      padding: '20px',
      border: '1px solid #eee',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      {/* Personal Info */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {resume.personalInfo?.profilePicture && (
          <img
            src={resume.personalInfo.profilePicture}
            alt="Foto de Perfil"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              margin: '0 auto 10px',
              objectFit: 'cover',
              border: '4px solid #ccc'
            }}
          />
        )}
        <h1 style={{ fontSize: '2.5em', margin: '0', color: '#333' }}>{resume.personalInfo?.fullName}</h1>
        <p style={{ margin: '5px 0', color: '#666' }}>{resume.personalInfo?.email} | {resume.personalInfo?.phone}</p>
        <p style={{ margin: '5px 0', color: '#666' }}>{resume.personalInfo?.address}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
          {resume.personalInfo?.linkedin && (
            <a href={resume.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
              LinkedIn
            </a>
          )}
          {resume.personalInfo?.github && (
            <a href={resume.personalInfo.github} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
              GitHub
            </a>
          )}
          {resume.personalInfo?.portfolio && (
            <a href={resume.personalInfo.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
              Portfólio
            </a>
          )}
        </div>
        {resume.personalInfo?.summary && (
          <p style={{ marginTop: '20px', lineHeight: '1.6', color: '#444' }}>{resume.personalInfo.summary}</p>
        )}
      </div>

      {/* Experience */}
      {resume.experiences.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.8em', borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: '15px', color: '#333' }}>Experiência</h2>
          {resume.experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.2em', margin: '0', color: '#555' }}>{exp.title} em {exp.company}</h3>
              <p style={{ margin: '5px 0', color: '#777' }}>{new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Presente"}</p>
              {exp.description && <p style={{ margin: '5px 0', color: '#444' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.educations.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.8em', borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: '15px', color: '#333' }}>Educação</h2>
          {resume.educations.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.2em', margin: '0', color: '#555' }}>{edu.degree} em {edu.fieldOfStudy} de {edu.institution}</h3>
              <p style={{ margin: '5px 0', color: '#777' }}>{new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : "Presente"}</p>
              {edu.description && <p style={{ margin: '5px 0', color: '#444' }}>{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.8em', borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: '15px', color: '#333' }}>Habilidades</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {resume.skills.map((skill) => (
              <span key={skill.id} style={{ background: '#e0e0e0', color: '#333', padding: '5px 10px', borderRadius: '5px', fontSize: '0.9em' }}>
                {skill.name} {skill.level && `(${skill.level})`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
