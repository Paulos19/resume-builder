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

export default function ClassicTemplate({ resume }: TemplateProps) {
  if (!resume) {
    return <div>Nenhum dado de currículo para exibir.</div>;
  }

  return (
    <div style={{
      fontFamily: 'Georgia, serif',
      margin: '20px',
      maxWidth: '700px',
      padding: '30px',
      border: '1px solid #ccc',
      boxShadow: '0 0 15px rgba(0,0,0,0.15)',
      backgroundColor: '#f9f9f9'
    }}>
      {/* Personal Info */}
      <div style={{ textAlign: 'left', marginBottom: '25px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
        <h1 style={{ fontSize: '2.8em', margin: '0', color: '#222' }}>{resume.personalInfo?.fullName}</h1>
        <p style={{ margin: '5px 0', color: '#555' }}>{resume.personalInfo?.email} | {resume.personalInfo?.phone}</p>
        <p style={{ margin: '5px 0', color: '#555' }}>{resume.personalInfo?.address}</p>
        <div style={{ marginTop: '10px' }}>
          {resume.personalInfo?.linkedin && (
            <a href={resume.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0056b3', textDecoration: 'underline', marginRight: '15px' }}>
              LinkedIn
            </a>
          )}
          {resume.personalInfo?.github && (
            <a href={resume.personalInfo.github} target="_blank" rel="noopener noreferrer" style={{ color: '#0056b3', textDecoration: 'underline', marginRight: '15px' }}>
              GitHub
            </a>
          )}
          {resume.personalInfo?.portfolio && (
            <a href={resume.personalInfo.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: '#0056b3', textDecoration: 'underline' }}>
              Portfólio
            </a>
          )}
        </div>
        {resume.personalInfo?.summary && (
          <p style={{ marginTop: '20px', lineHeight: '1.7', color: '#333' }}>{resume.personalInfo.summary}</p>
        )}
      </div>

      {/* Experience */}
      {resume.experiences.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '2em', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '15px', color: '#222' }}>Experiência</h2>
          {resume.experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.3em', margin: '0', color: '#444' }}>{exp.title} em {exp.company}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>{exp.location}</p>
              <p style={{ margin: '5px 0', color: '#666' }}>{new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Presente"}</p>
              {exp.description && <p style={{ margin: '5px 0', color: '#333' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.educations.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '2em', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '15px', color: '#222' }}>Educação</h2>
          {resume.educations.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.3em', margin: '0', color: '#444' }}>{edu.degree} em {edu.fieldOfStudy} de {edu.institution}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>{new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : "Presente"}</p>
              {edu.description && <p style={{ margin: '5px 0', color: '#333' }}>{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div>
          <h2 style={{ fontSize: '2em', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '15px', color: '#222' }}>Habilidades</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {resume.skills.map((skill) => (
              <span key={skill.id} style={{ background: '#e0e0e0', color: '#333', padding: '5px 12px', borderRadius: '3px', fontSize: '1em', border: '1px solid #ccc' }}>
                {skill.name} {skill.level && `(${skill.level})`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
