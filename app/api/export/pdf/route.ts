import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import puppeteer from "puppeteer";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  let browser;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const url = new URL(request.url);
    const resumeId = url.searchParams.get("resumeId");
    const templateName = url.searchParams.get("templateName") || "ModernTemplate";

    if (!resumeId) {
      return new NextResponse("Resume ID is required", { status: 400 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: user.id },
      include: {
        personalInfo: true,
        experiences: true,
        educations: true,
        skills: true,
      },
    });

    if (!resume) {
      return new NextResponse("Resume not found", { status: 404 });
    }

    const customization = await prisma.customization.findUnique({
      where: {
        resumeId_templateName: {
          resumeId: resumeId,
          templateName: templateName,
        },
      },
    });

    const customStyles = customization?.styles as Record<string, any> || {};



    let htmlContent = '';

    // Helper function to format dates
    const formatDate = (date: Date | null) => {
      if (!date) return "Presente";
      return new Date(date).toLocaleDateString();
    };

    // Helper function to apply custom styles
    const applyStyles = (elementStyles: Record<string, any>) => {
      return Object.entries(elementStyles)
        .map(([key, value]) => `${key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)}: ${value};`)
        .join(' ');
    };

    // Generate HTML based on templateName
    switch (templateName) {
      case "ModernTemplate":
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${resume.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; ${applyStyles(customStyles.body || {})} }
              h1 { color: #333; ${applyStyles(customStyles.h1 || {})} }
              h2 { color: #555; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px; ${applyStyles(customStyles.h2 || {})} }
              p { margin-bottom: 5px; ${applyStyles(customStyles.p || {})} }
              .section { margin-bottom: 15px; ${applyStyles(customStyles.section || {})} }
              .item { margin-bottom: 10px; ${applyStyles(customStyles.item || {})} }
              .item h3 { margin: 0; font-size: 1.1em; ${applyStyles(customStyles.itemH3 || {})} }
              .item p { margin: 0; font-size: 0.9em; ${applyStyles(customStyles.itemP || {})} }
            </style>
          </head>
          <body>
            <div style="text-align: center; margin-bottom: 20px; ${applyStyles(customStyles.personalInfoContainer || {})}">
              ${resume.personalInfo?.profilePicture ? `<img src="${resume.personalInfo.profilePicture}" alt="Foto de Perfil" style="width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 10px; object-fit: cover; border: 4px solid #ccc; ${applyStyles(customStyles.profilePicture || {})}" />` : ''}
              <h1 style="font-size: 2.5em; margin: 0; color: #333; ${applyStyles(customStyles.fullName || {})}">${resume.personalInfo?.fullName || ""}</h1>
              <p style="margin: 5px 0; color: #666; ${applyStyles(customStyles.contactInfo || {})}">${resume.personalInfo?.email || ""} | ${resume.personalInfo?.phone || ""}</p>
              <p style="margin: 5px 0; color: #666; ${applyStyles(customStyles.address || {})}">${resume.personalInfo?.address || ""}</p>
              <div style="display: flex; justify-content: center; gap: 15px; margin-top: 10px; ${applyStyles(customStyles.socialLinksContainer || {})}">
                ${resume.personalInfo?.linkedin ? `<a href="${resume.personalInfo.linkedin}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; ${applyStyles(customStyles.linkedin || {})}">LinkedIn</a>` : ''}
                ${resume.personalInfo?.github ? `<a href="${resume.personalInfo.github}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; ${applyStyles(customStyles.github || {})}">GitHub</a>` : ''}
                ${resume.personalInfo?.portfolio ? `<a href="${resume.personalInfo.portfolio}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none; ${applyStyles(customStyles.portfolio || {})}">Portfólio</a>` : ''}
              </div>
              ${resume.personalInfo?.summary ? `<p style="margin-top: 20px; line-height: 1.6; color: #444; ${applyStyles(customStyles.summary || {})}">${resume.personalInfo.summary}</p>` : ''}
            </div>

            ${resume.experiences.length > 0 ? `
            <div style="margin-bottom: 20px; ${applyStyles(customStyles.experiencesContainer || {})}">
              <h2 style="font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 15px; color: #333; ${applyStyles(customStyles.experiencesTitle || {})}">Experiência</h2>
              ${resume.experiences.map((exp) => `
                <div style="margin-bottom: 15px; ${applyStyles(customStyles.experienceItem || {})}">
                  <h3 style="font-size: 1.2em; margin: 0; color: #555; ${applyStyles(customStyles.experienceTitle || {})}">${exp.title} em ${exp.company}</h3>
                  <p style="margin: 5px 0; color: #777; ${applyStyles(customStyles.experienceDates || {})}">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</p>
                  <p style="margin: 5px 0; color: #777; ${applyStyles(customStyles.experienceLocation || {})}">${exp.location || ""}</p>
                  ${exp.description ? `<p style="margin: 5px 0; color: #444; ${applyStyles(customStyles.experienceDescription || {})}">${exp.description}</p>` : ''}
                </div>
              `).join("")}
            </div>
            ` : ''}

            ${resume.educations.length > 0 ? `
            <div style="margin-bottom: 20px; ${applyStyles(customStyles.educationsContainer || {})}">
              <h2 style="font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 15px; color: #333; ${applyStyles(customStyles.educationsTitle || {})}">Educação</h2>
              ${resume.educations.map((edu) => `
                <div style="margin-bottom: 15px; ${applyStyles(customStyles.educationItem || {})}">
                  <h3 style="font-size: 1.2em; margin: 0; color: #555; ${applyStyles(customStyles.educationTitle || {})}">${edu.degree} em ${edu.fieldOfStudy} de ${edu.institution}</h3>
                  <p style="margin: 5px 0; color: #777; ${applyStyles(customStyles.educationDates || {})}">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</p>
                  ${edu.description ? `<p style="margin: 5px 0; color: #444; ${applyStyles(customStyles.educationDescription || {})}">${edu.description}</p>` : ''}
                </div>
              `).join("")}
            </div>
            ` : ''}

            ${resume.skills.length > 0 ? `
            <div>
              <h2 style="font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 15px; color: #333; ${applyStyles(customStyles.skillsTitle || {})}">Habilidades</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; ${applyStyles(customStyles.skillsContainer || {})}">
                ${resume.skills.map((skill) => `
                  <span style="background: #e0e0e0; color: #333; padding: 5px 10px; border-radius: 5px; font-size: 0.9em; ${applyStyles(customStyles.skillItem || {})}">
                    ${skill.name} ${skill.level ? `(${skill.level})` : ''}
                  </span>
                `).join("")}
              </div>
            </div>
            ` : ''}
          </body>
          </html>
        `;
        break;

      case "ElegantTemplate":
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${resume.title}</title>
            <style>
              body { font-family: Georgia, serif; margin: 20px; ${applyStyles(customStyles.body || {})} }
              h1 { color: #222; ${applyStyles(customStyles.h1 || {})} }
              h2 { color: #222; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 25px; ${applyStyles(customStyles.h2 || {})} }
              p { margin-bottom: 5px; ${applyStyles(customStyles.p || {})} }
              a { color: #0056b3; text-decoration: underline; ${applyStyles(customStyles.a || {})} }
              .section { margin-bottom: 25px; ${applyStyles(customStyles.section || {})} }
              .item { margin-bottom: 15px; ${applyStyles(customStyles.item || {})} }
              .item h3 { margin: 0; font-size: 1.3em; ${applyStyles(customStyles.itemH3 || {})} }
              .item p { margin: 0; font-size: 1em; ${applyStyles(customStyles.itemP || {})} }
            </style>
          </head>
          <body>
            <div style="text-align: left; margin-bottom: 25px; border-bottom: 1px solid #ddd; padding-bottom: 15px; ${applyStyles(customStyles.personalInfoContainer || {})}">
              <h1 style="font-size: 2.8em; margin: 0; color: #222; ${applyStyles(customStyles.fullName || {})}">${resume.personalInfo?.fullName || ""}</h1>
              <p style="margin: 5px 0; color: #555; ${applyStyles(customStyles.contactInfo || {})}">${resume.personalInfo?.email || ""} | ${resume.personalInfo?.phone || ""}</p>
              <p style="margin: 5px 0; color: #555; ${applyStyles(customStyles.address || {})}">${resume.personalInfo?.address || ""}</p>
              <div style="margin-top: 10px; ${applyStyles(customStyles.socialLinksContainer || {})}">
                ${resume.personalInfo?.linkedin ? `<a href="${resume.personalInfo.linkedin}" target="_blank" rel="noopener noreferrer" style="margin-right: 15px; ${applyStyles(customStyles.linkedin || {})}">LinkedIn</a>` : ''}
                ${resume.personalInfo?.github ? `<a href="${resume.personalInfo.github}" target="_blank" rel="noopener noreferrer" style="margin-right: 15px; ${applyStyles(customStyles.github || {})}">GitHub</a>` : ''}
                ${resume.personalInfo?.portfolio ? `<a href="${resume.personalInfo.portfolio}" target="_blank" rel="noopener noreferrer" style="${applyStyles(customStyles.portfolio || {})}">Portfólio</a>` : ''}
              </div>
              ${resume.personalInfo?.summary ? `<p style="margin-top: 20px; line-height: 1.7; color: #333; ${applyStyles(customStyles.summary || {})}">${resume.personalInfo.summary}</p>` : ''}
            </div>

            ${resume.experiences.length > 0 ? `
            <div style="margin-bottom: 25px; ${applyStyles(customStyles.experiencesContainer || {})}">
              <h2 style="font-size: 2em; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #222; ${applyStyles(customStyles.experiencesTitle || {})}">Experiência</h2>
              ${resume.experiences.map((exp) => `
                <div style="margin-bottom: 15px; ${applyStyles(customStyles.experienceItem || {})}">
                  <h3 style="font-size: 1.3em; margin: 0; color: #444; ${applyStyles(customStyles.experienceTitle || {})}">${exp.title} em ${exp.company}</h3>
                  <p style="margin: 5px 0; color: #666; ${applyStyles(customStyles.experienceLocation || {})}">${exp.location || ""}</p>
                  <p style="margin: 5px 0; color: #666; ${applyStyles(customStyles.experienceDates || {})}">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</p>
                  ${exp.description ? `<p style="margin: 5px 0; color: #333; ${applyStyles(customStyles.experienceDescription || {})}">${exp.description}</p>` : ''}
                </div>
              `).join("")}
            </div>
            ` : ''}

            ${resume.educations.length > 0 ? `
            <div style="margin-bottom: 25px; ${applyStyles(customStyles.educationsContainer || {})}">
              <h2 style="font-size: 2em; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #222; ${applyStyles(customStyles.educationsTitle || {})}">Educação</h2>
              ${resume.educations.map((edu) => `
                <div style="margin-bottom: 15px; ${applyStyles(customStyles.educationItem || {})}">
                  <h3 style="font-size: 1.3em; margin: 0; color: #444; ${applyStyles(customStyles.educationTitle || {})}">${edu.degree} em ${edu.fieldOfStudy} de ${edu.institution}</h3>
                  <p style="margin: 5px 0; color: #666; ${applyStyles(customStyles.educationDates || {})}">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</p>
                  ${edu.description ? `<p style="margin: 5px 0; color: #333; ${applyStyles(customStyles.educationDescription || {})}">${edu.description}</p>` : ''}
                </div>
              `).join("")}
            </div>
            ` : ''}

            ${resume.skills.length > 0 ? `
            <div>
              <h2 style="font-size: 2em; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #222; ${applyStyles(customStyles.skillsTitle || {})}">Habilidades</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; ${applyStyles(customStyles.skillsContainer || {})}">
                ${resume.skills.map((skill) => `
                  <span style="background: #e0e0e0; color: #333; padding: 5px 12px; border-radius: 3px; font-size: 1em; border: 1px solid #ccc; ${applyStyles(customStyles.skillItem || {})}">
                    ${skill.name} ${skill.level ? `(${skill.level})` : ''}
                  </span>
                `).join("")}
              </div>
            </div>
            ` : ''}
          </body>
          </html>
        `;
        break;

      case "ClassicTemplate":
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${resume.title}</title>
            <style>
              body { font-family: Georgia, serif; margin: 20px; max-width: 700px; padding: 30px; border: 1px solid #ccc; box-shadow: 0 0 15px rgba(0,0,0,0.15); background-color: #f9f9f9; ${applyStyles(customStyles.body || {})} }
              h1 { font-size: 2.8em; margin: 0; color: #222; ${applyStyles(customStyles.h1 || {})} }
              h2 { font-size: 2em; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #222; ${applyStyles(customStyles.h2 || {})} }
              h3 { margin: 0; font-size: 1.3em; ${applyStyles(customStyles.h3 || {})} }
              p { margin-bottom: 5px; ${applyStyles(customStyles.p || {})} }
              a { color: #0056b3; text-decoration: underline; ${applyStyles(customStyles.a || {})} }
              .section { margin-bottom: 25px; ${applyStyles(customStyles.section || {})} }
              .item { margin-bottom: 15px; ${applyStyles(customStyles.item || {})} }
            </style>
          </head>
          <body>
            <div style="text-align: left; margin-bottom: 25px; border-bottom: 1px solid #ddd; padding-bottom: 15px; ${applyStyles(customStyles.personalInfoContainer || {})}">
              <h1 style="font-size: 2.8em; margin: 0; color: #222; ${applyStyles(customStyles.fullName || {})}">${resume.personalInfo?.fullName || ""}</h1>
              <p style="margin: 5px 0; color: #555; ${applyStyles(customStyles.contactInfo || {})}">${resume.personalInfo?.email || ""} | ${resume.personalInfo?.phone || ""}</p>
              <p style="margin: 5px 0; color: #555; ${applyStyles(customStyles.address || {})}">${resume.personalInfo?.address || ""}</p>
              <div style="margin-top: 10px; ${applyStyles(customStyles.socialLinksContainer || {})}">
                ${resume.personalInfo?.linkedin ? `<a href="${resume.personalInfo.linkedin}" target="_blank" rel="noopener noreferrer" style="margin-right: 15px; ${applyStyles(customStyles.linkedin || {})}">LinkedIn</a>` : ''}
                ${resume.personalInfo?.github ? `<a href="${resume.personalInfo.github}" target="_blank" rel="noopener noreferrer" style="margin-right: 15px; ${applyStyles(customStyles.github || {})}">GitHub</a>` : ''}
                ${resume.personalInfo?.portfolio ? `<a href="${resume.personalInfo.portfolio}" target="_blank" rel="noopener noreferrer" style="${applyStyles(customStyles.portfolio || {})}">Portfólio</a>` : ''}
              </div>
              ${resume.personalInfo?.summary ? `<p style="margin-top: 20px; line-height: 1.7; color: #333; ${applyStyles(customStyles.summary || {})}">${resume.personalInfo.summary}</p>` : ''}
            </div>

            ${resume.experiences.length > 0 ? `
            <div style="margin-bottom: 25px; ${applyStyles(customStyles.experiencesContainer || {})}">
              <h2 style="font-size: 2em; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #222; ${applyStyles(customStyles.experiencesTitle || {})}">Experiência</h2>
              ${resume.experiences.map((exp) => `
                <div style="margin-bottom: 15px; ${applyStyles(customStyles.experienceItem || {})}">
                  <h3 style="font-size: 1.3em; margin: 0; color: #444; ${applyStyles(customStyles.experienceTitle || {})}">${exp.title} em ${exp.company}</h3>
                  <p style="margin: 5px 0; color: #666; ${applyStyles(customStyles.experienceLocation || {})}">${exp.location || ""}</p>
                  <p style="margin: 5px 0; color: #666; ${applyStyles(customStyles.experienceDates || {})}">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</p>
                  ${exp.description ? `<p style="margin: 5px 0; color: #333; ${applyStyles(customStyles.experienceDescription || {})}">${exp.description}</p>` : ''}
                </div>
              `).join("")}
            </div>
            ` : ''}

            ${resume.educations.length > 0 ? `
            <div style="margin-bottom: 25px; ${applyStyles(customStyles.educationsContainer || {})}">
              <h2 style="font-size: 2em; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #222; ${applyStyles(customStyles.educationsTitle || {})}">Educação</h2>
              ${resume.educations.map((edu) => `
                <div style="margin-bottom: 15px; ${applyStyles(customStyles.educationItem || {})}">
                  <h3 style="font-size: 1.3em; margin: 0; color: #444; ${applyStyles(customStyles.educationTitle || {})}">${edu.degree} em ${edu.fieldOfStudy} de ${edu.institution}</h3>
                  <p style="margin: 5px 0; color: #666; ${applyStyles(customStyles.educationDates || {})}">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</p>
                  ${edu.description ? `<p style="margin: 5px 0; color: #333; ${applyStyles(customStyles.educationDescription || {})}">${edu.description}</p>` : ''}
                </div>
              `).join("")}
            </div>
            ` : ''}

            ${resume.skills.length > 0 ? `
            <div>
              <h2 style="font-size: 2em; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #222; ${applyStyles(customStyles.skillsTitle || {})}">Habilidades</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; ${applyStyles(customStyles.skillsContainer || {})}">
                ${resume.skills.map((skill) => `
                  <span style="background: #e0e0e0; color: #333; padding: 5px 12px; border-radius: 3px; font-size: 1em; border: 1px solid #ccc; ${applyStyles(customStyles.skillItem || {})}">
                    ${skill.name} ${skill.level ? `(${skill.level})` : ''}
                  </span>
                `).join("")}
              </div>
            </div>
            ` : ''}
          </body>
          </html>
        `;
        break;

      case "CreativeTemplate":
        // NOTE: This template uses Tailwind CSS classes.
        // These styles will NOT be applied in the PDF unless you have a build step
        // that compiles Tailwind to raw CSS and injects it here.
        // The PDF will likely appear unstyled for this template.
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${resume.title}</title>
            <style>
              /* Tailwind CSS compiled styles */
              @font-face{font-family:Geist;font-style:normal;font-weight:100 900;font-display:swap;src:url(/_next/static/media/8d697b304b401681-s.woff2) format("woff2");unicode-range:u+0301,u+0400-045f,u+0490-0491,u+04b0-04b1,u+2116}@font-face{font-family:Geist;font-style:normal;font-weight:100 900;font-display:swap;src:url(/_next/static/media/ba015fad6dcf6784-s.woff2) format("woff2");unicode-range:u+0100-02ba,u+02bd-02c5,u+02c7-02cc,u+02ce-02d7,u+02dd-02ff,u+0304,u+0308,u+0329,u+1d00-1dbf,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff}@font-face{font-family:Geist;font-style:normal;font-weight:100 900;font-display:swap;src:url(/_next/static/media/569ce4b8f30dc480-s.p.woff2) format("woff2");unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}@font-face{font-family:Geist Fallback;src:local("Arial");ascent-override:95.94%;descent-override:28.16%;line-gap-override:0.00%;size-adjust:104.76%}.__className_5cfdac{font-family:Geist,Geist Fallback;font-style:normal}.__variable_5cfdac{--font-geist-sans:"Geist","Geist Fallback"}@font-face{font-family:Geist Mono;font-style:normal;font-weight:100 900;font-display:swap;src:url(/_next/static/media/9610d9e46709d722-s.woff2) format("woff2");unicode-range:u+0301,u+0400-045f,u+0490-0491,u+04b0-04b1,u+2116}@font-face{font-family:Geist Mono;font-style:normal;font-weight:100 900;font-display:swap;src:url(/_next/static/media/747892c23ea88013-s.woff2) format("woff2");unicode-range:u+0100-02ba,u+02bd-02c5,u+02c7-02cc,u+02ce-02d7,u+02dd-02ff,u+0304,u+0308,u+0329,u+1d00-1dbf,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff}@font-face{font-family:Geist Mono;font-style:normal;font-weight:100 900;font-display:swap;src:url(/_next/static/media/93f479601ee12b01-s.p.woff2) format("woff2");unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,... [truncated]

/*
! tailwindcss v3.4.3 | MIT License | https://tailwindcss.com
*/*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}:after,:before{--tw-content:""}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}me... [truncated]
            </style>
          </head>
          <body>
            <div class="bg-gray-50 p-8 font-sans">
              <div class="grid grid-cols-3 gap-8">
                <div class="col-span-1 bg-blue-500 text-white p-6 rounded-lg">
                  <div class="text-center mb-8">
                    ${resume.personalInfo?.profilePicture ? `<img src="${resume.personalInfo.profilePicture}" alt="Profile" class="w-32 h-32 rounded-full mx-auto mb-4" />` : ''}
                    <h1 class="text-3xl font-bold">${resume.personalInfo?.fullName || ""}</h1>
                  </div>

                  <div class="mb-8">
                    <h2 class="text-xl font-semibold border-b-2 border-white pb-2 mb-4">Contato</h2>
                    <p>${resume.personalInfo?.email || ""}</p>
                    <p>${resume.personalInfo?.phone || ""}</p>
                    <p>${resume.personalInfo?.address || ""}</p>
                  </div>

                  <div class="mb-8">
                    <h2 class="text-xl font-semibold border-b-2 border-white pb-2 mb-4">Habilidades</h2>
                    <ul class="space-y-2">
                      ${resume.skills.map((skill) => `
                        <li>${skill.name}</li>
                      `).join("")}
                    </ul>
                  </div>
                </div>

                <div class="col-span-2">
                  <section class="mb-8">
                    <h2 class="text-3xl font-bold text-blue-500 border-b-4 border-blue-200 pb-2 mb-4">Resumo</h2>
                    <p class="text-gray-700">${resume.personalInfo?.summary || ""}</p>
                  </section>

                  <section class="mb-8">
                    <h2 class="text-3xl font-bold text-blue-500 border-b-4 border-blue-200 pb-2 mb-4">Experiência</h2>
                    ${resume.experiences.map((exp) => `
                      <div class="mb-6">
                        <h3 class="text-2xl font-semibold text-gray-800">${exp.title}</h3>
                        <p class="text-lg text-gray-600">${exp.company} | ${exp.location || ""}</p>
                        <p class="text-md text-gray-500">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</p>
                        <p class="text-gray-700 mt-2">${exp.description || ""}</p>
                      </div>
                    `).join("")}
                  </section>

                  <section>
                    <h2 class="text-3xl font-bold text-blue-500 border-b-4 border-blue-200 pb-2 mb-4">Educação</h2>
                    ${resume.educations.map((edu) => `
                      <div class="mb-6">
                        <h3 class="text-2xl font-semibold text-gray-800">${edu.institution}</h3>
                        <p class="text-lg text-gray-600">${edu.degree}, ${edu.fieldOfStudy || ""}</p>
                        <p class="text-md text-gray-500">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</p>
                      </div>
                    `).join("")}
                  </section>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      default:
        // Default to ModernTemplate if templateName is not recognized
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${resume.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              h2 { color: #555; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px; }
              p { margin-bottom: 5px; }
              .section { margin-bottom: 15px; }
              .item { margin-bottom: 10px; }
              .item h3 { margin: 0; font-size: 1.1em; }
              .item p { margin: 0; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div style="text-align: center; margin-bottom: 20px;">
              ${resume.personalInfo?.profilePicture ? `<img src="${resume.personalInfo.profilePicture}" alt="Foto de Perfil" style="width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 10px; object-fit: cover; border: 4px solid #ccc;" />` : ''}
              <h1 style="font-size: 2.5em; margin: 0; color: #333;">${resume.personalInfo?.fullName || ""}</h1>
              <p style="margin: 5px 0; color: #666;">${resume.personalInfo?.email || ""} | ${resume.personalInfo?.phone || ""}</p>
              <p style="margin: 5px 0; color: #666;">${resume.personalInfo?.address || ""}</p>
              <div style="display: flex; justify-content: center; gap: 15px; margin-top: 10px;">
                ${resume.personalInfo?.linkedin ? `<a href="${resume.personalInfo.linkedin}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none;">LinkedIn</a>` : ''}
                ${resume.personalInfo?.github ? `<a href="${resume.personalInfo.github}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none;">GitHub</a>` : ''}
                ${resume.personalInfo?.portfolio ? `<a href="${resume.personalInfo.portfolio}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none;">Portfólio</a>` : ''}
              </div>
              ${resume.personalInfo?.summary ? `<p style="margin-top: 20px; line-height: 1.6; color: #444;">${resume.personalInfo.summary}</p>` : ''}
            </div>

            ${resume.experiences.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 15px; color: #333;">Experiência</h2>
              ${resume.experiences.map((exp) => `
                <div style="margin-bottom: 15px;">
                  <h3 style="font-size: 1.2em; margin: 0; color: #555;">${exp.title} em ${exp.company}</h3>
                  <p style="margin: 5px 0; color: #777;">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</p>
                  <p style="margin: 5px 0; color: #777;">${exp.location || ""}</p>
                  ${exp.description ? `<p style="margin: 5px 0; color: #444;">${exp.description}</p>` : ''}
                </div>
              `).join("")}
            </div>
            ` : ''}

            ${resume.educations.length > 0 ? `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 15px; color: #333;">Educação</h2>
              ${resume.educations.map((edu) => `
                <div style="margin-bottom: 15px;">
                  <h3 style="font-size: 1.2em; margin: 0; color: #555;">${edu.degree} em ${edu.fieldOfStudy} de ${edu.institution}</h3>
                  <p style="margin: 5px 0; color: #777;">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</p>
                  ${edu.description ? `<p style="margin: 5px 0; color: #444;">${edu.description}</p>` : ''}
                </div>
              `).join("")}
            </div>
            ` : ''}

            ${resume.skills.length > 0 ? `
            <div>
              <h2 style="font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 15px; color: #333;">Habilidades</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${resume.skills.map((skill) => `
                  <span style="background: #e0e0e0; color: #333; padding: 5px 10px; border-radius: 5px; font-size: 0.9em;">
                    ${skill.name} ${skill.level ? `(${skill.level})` : ''}
                  </span>
                `).join("")}
              </div>
            </div>
            ` : ''}
          </body>
          </html>
        `;
        break;
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    const page = await browser.newPage();

    // Set the HTML content directly
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: "A4" });

    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${resume.title || "resume"}.pdf`,
    });

    return new NextResponse(pdfBuffer, { headers });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Error generating PDF", { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}