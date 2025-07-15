import React from 'react';

const CreativeTemplate = ({ resume }: any) => {
  const { personalInfo, experiences, educations, skills } = resume;

  return (
    <div className="bg-gray-50 p-8 font-sans">
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 bg-blue-500 text-white p-6 rounded-lg">
          <div className="text-center mb-8">
            {personalInfo?.profilePicture && (
              <img src={personalInfo.profilePicture} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold">{personalInfo?.fullName}</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold border-b-2 border-white pb-2 mb-4">Contato</h2>
            <p>{personalInfo?.email}</p>
            <p>{personalInfo?.phone}</p>
            <p>{personalInfo?.address}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold border-b-2 border-white pb-2 mb-4">Habilidades</h2>
            <ul className="space-y-2">
              {skills?.map((skill: any) => (
                <li key={skill.id}>{skill.name}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-span-2">
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-blue-500 border-b-4 border-blue-200 pb-2 mb-4">Resumo</h2>
            <p className="text-gray-700">{personalInfo?.summary}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-3xl font-bold text-blue-500 border-b-4 border-blue-200 pb-2 mb-4">Experiência</h2>
            {experiences?.map((exp: any) => (
              <div key={exp.id} className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">{exp.title}</h3>
                <p className="text-lg text-gray-600">{exp.company} | {exp.location}</p>
                <p className="text-md text-gray-500">{new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Presente'}</p>
                <p className="text-gray-700 mt-2">{exp.description}</p>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-3xl font-bold text-blue-500 border-b-4 border-blue-200 pb-2 mb-4">Educação</h2>
            {educations?.map((edu: any) => (
              <div key={edu.id} className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">{edu.institution}</h3>
                <p className="text-lg text-gray-600">{edu.degree}, {edu.fieldOfStudy}</p>
                <p className="text-md text-gray-500">{new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Presente'}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreativeTemplate;
