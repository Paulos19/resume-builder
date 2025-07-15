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
    const personalInfo = await prisma.personalInfo.findUnique({
      where: { resumeId: id },
    });

    if (!personalInfo) {
      return new NextResponse("Personal info not found for this resume", { status: 404 });
    }

    return NextResponse.json(personalInfo);
  } catch (error) {
    console.error("Error fetching personal info:", error);
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
    const { fullName, email, phone, address, linkedin, github, portfolio, profilePicture, summary } = body;

    if (!fullName || !email) {
      return new NextResponse("Full name and email are required", { status: 400 });
    }

    // Check if personal info already exists for this resume
    const existingPersonalInfo = await prisma.personalInfo.findUnique({
      where: { resumeId: id },
    });

    if (existingPersonalInfo) {
      return new NextResponse("Personal info already exists for this resume. Use PUT to update.", { status: 409 });
    }

    const newPersonalInfo = await prisma.personalInfo.create({
      data: {
        resume: { connect: { id: id } },
        fullName,
        email,
        phone,
        address,
        linkedin,
        github,
        portfolio,
        profilePicture,
        summary,
      },
    });

    return NextResponse.json(newPersonalInfo, { status: 201 });
  } catch (error) {
    console.error("Error creating personal info:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
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
    const { fullName, email, phone, address, linkedin, github, portfolio, profilePicture, summary } = body;

    if (!fullName || !email) {
      return new NextResponse("Full name and email are required", { status: 400 });
    }

    const updatedPersonalInfo = await prisma.personalInfo.update({
      where: { resumeId: id },
      data: {
        fullName,
        email,
        phone,
        address,
        linkedin,
        github,
        portfolio,
        profilePicture,
        summary,
      },
    });

    return NextResponse.json(updatedPersonalInfo);
  } catch (error) {
    console.error("Error updating personal info:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
