import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string; educationId: string } }
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

    const { id, educationId } = await params;
    const education = await prisma.education.findUnique({
      where: { id: educationId, resumeId: id },
    });

    if (!education) {
      return new NextResponse("Education not found", { status: 404 });
    }

    return NextResponse.json(education);
  } catch (error) {
    console.error("Error fetching education:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; educationId: string } }
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

    const { id, educationId } = await params;
    const body = await request.json();
    const { institution, degree, fieldOfStudy, startDate, endDate, description } = body;

    if (!institution || !degree || !startDate) {
      return new NextResponse("Institution, degree, and start date are required", { status: 400 });
    }

    const updatedEducation = await prisma.education.update({
      where: { id: educationId, resumeId: id },
      data: {
        institution,
        degree,
        fieldOfStudy,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
      },
    });

    return NextResponse.json(updatedEducation);
  } catch (error) {
    console.error("Error updating education:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; educationId: string } }
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

    const { id, educationId } = await params;
    await prisma.education.delete({
      where: { id: educationId, resumeId: id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting education:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
