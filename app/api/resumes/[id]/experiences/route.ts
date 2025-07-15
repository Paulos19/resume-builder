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
    const experiences = await prisma.experience.findMany({
      where: { resumeId: id },
    });

    return NextResponse.json(experiences);
  } catch (error) {
    console.error("Error fetching experiences:", error);
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
    const { title, company, location, startDate, endDate, description } = body;

    // Helper function to parse date strings or objects
    const parseDate = (dateValue: any): Date | null => {
      if (!dateValue) return null;

      // If it's an object with a 'value' property (as seen in the error)
      if (typeof dateValue === 'object' && dateValue !== null && dateValue.$type === 'DateTime' && typeof dateValue.value === 'string') {
        return new Date(dateValue.value);
      }
      // If it's a string (e.g., "YYYY-MM-DD")
      if (typeof dateValue === 'string') {
        return new Date(dateValue);
      }
      // If it's already a Date object (unlikely from JSON, but for safety)
      if (dateValue instanceof Date) {
        return dateValue;
      }
      return null; // Invalid format
    };

    const parsedStartDate = parseDate(startDate);
    const parsedEndDate = parseDate(endDate);

    if (!title || !company || !parsedStartDate) {
      return new NextResponse("Title, company, and start date are required", { status: 400 });
    }

    const newExperience = await prisma.experience.create({
      data: {
        resume: { connect: { id: id } },
        title,
        company,
        location,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        description,
      },
    });

    return NextResponse.json(newExperience, { status: 201 });
  } catch (error) {
    console.error("Error creating experience:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
