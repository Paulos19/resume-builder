import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
  request: Request
) {
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

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: resume.personalInfo?.fullName || "",
                  bold: true,
                  size: 32, // Corresponds to ~16pt
                }),
              ],
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              children: [
                new TextRun(
                  `${resume.personalInfo?.email || ""} | ${resume.personalInfo?.phone || ""}`
                ),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(resume.personalInfo?.linkedin || ""),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(resume.personalInfo?.summary || ""),
              ],
            }),

            new Paragraph({
              children: [new TextRun({ text: "Experience", bold: true, size: 28 })],
              spacing: { before: 200, after: 100 },
            }),
            ...(resume.experiences || []).map((exp: { title: string; company: string; startDate: Date; endDate: Date | null; location: string | null; description: string | null; }) => {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.title} at ${exp.company}`,
                    bold: true,
                  }),
                  new TextRun(
                    `\n${new Date(exp.startDate).toDateString()} - ${exp.endDate ? new Date(exp.endDate).toDateString() : "Present"}`
                  ),
                  new TextRun(`\n${exp.location || ""}`),
                  new TextRun(`\n${exp.description || ""}`),
                ],
                spacing: { after: 100 },
              });
            }),

            new Paragraph({
              children: [new TextRun({ text: "Education", bold: true, size: 28 })],
              spacing: { before: 200, after: 100 },
            }),
            ...(resume.educations || []).map((edu: { degree: string; fieldOfStudy: string | null; institution: string; startDate: Date; endDate: Date | null; description: string | null; }) => {
              return new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution}`,
                    bold: true,
                  }),
                  new TextRun(
                    `\n${new Date(edu.startDate).toDateString()} - ${edu.endDate ? new Date(edu.endDate).toDateString() : "Present"}`
                  ),
                  new TextRun(`\n${edu.description || ""}`),
                ],
                spacing: { after: 100 },
              });
            }),

            new Paragraph({
              children: [new TextRun({ text: "Skills", bold: true, size: 28 })],
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun(
                  (resume.skills || []).map((skill: { name: string; level: string | null; }) => `${skill.name} (${skill.level || ""})`).join(", ")
                ),
              ],
            }),
          ],
        },
      ],
    });

    const b64string = await Packer.toBase64String(doc);

    return new NextResponse(Buffer.from(b64string, "base64"), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${resume.title || "resume"}.docx"`,
      },
    });
  } catch (error) {
    console.error("Error generating DOCX:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}