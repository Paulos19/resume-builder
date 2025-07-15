import React from 'react';

const ElegantTemplate = ({ resume }: any) => {
  const { personalInfo, experiences, educations, skills } = resume;

  return (
    <div className="bg-white p-8 font-serif">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">{personalInfo?.fullName}</h1>
        <p className="text-lg text-gray-600">{personalInfo?.email} • {personalInfo?.phone}</p>
        <p className="text-lg text-gray-600">{personalInfo?.address}</p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Resumo</h2>
        <p className="text-gray-700">{personalInfo?.summary}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Experiência</h2>
        {experiences?.map((exp: any) => (
          <div key={exp.id} className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{exp.title}</h3>
            <p className="text-md text-gray-600">{exp.company} | {exp.location}</p>
            <p className="text-sm text-gray-500">{new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Presente'}</p>
            <p className="text-gray-700 mt-2">{exp.description}</p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Educação</h2>
        {educations?.map((edu: any) => (
          <div key={edu.id} className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{edu.institution}</h3>
            <p className="text-md text-gray-600">{edu.degree}, {edu.fieldOfStudy}</p>
            <p className="text-sm text-gray-500">{new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Presente'}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Habilidades</h2>
        <ul className="list-disc list-inside grid grid-cols-2 gap-2 text-gray-700">
          {skills?.map((skill: any) => (
            <li key={skill.id}>{skill.name}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ElegantTemplate;
