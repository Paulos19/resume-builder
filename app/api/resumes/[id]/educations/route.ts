import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    const { id } = await params; // This 'id' is the resumeId
    const educations = await prisma.education.findMany({
      where: { resumeId: id },
    });

    return NextResponse.json(educations);
  } catch (error) {
    console.error("Error fetching educations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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

    const { id } = await params; // This 'id' is the resumeId
    const body = await request.json();
    const { institution, degree, fieldOfStudy, startDate, endDate, description } = body;

    if (!institution || !degree || !startDate) {
      return new NextResponse("Institution, degree, and start date are required", { status: 400 });
    }

    const newEducation = await prisma.education.create({
      data: {
        resume: { connect: { id: id } },
        institution,
        degree,
        fieldOfStudy,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
      },
    });

    return NextResponse.json(newEducation, { status: 201 });
  } catch (error) {
    console.error("Error creating education:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
