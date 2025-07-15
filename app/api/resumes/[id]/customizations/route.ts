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

    const { id: resumeId } = await params;
    const url = new URL(request.url);
    const templateName = url.searchParams.get("templateName");

    if (!templateName) {
      return new NextResponse("Template name is required", { status: 400 });
    }

    const customization = await prisma.customization.findUnique({
      where: {
        resumeId_templateName: {
          resumeId: resumeId,
          templateName: templateName,
        },
      },
    });

    if (!customization) {
      return new NextResponse("Customization not found", { status: 404 });
    }

    return NextResponse.json(customization);
  } catch (error) {
    console.error("Error fetching customization:", error);
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

    const { id: resumeId } = await params;
    const body = await request.json();
    const { templateName, styles } = body;

    if (!templateName || !styles) {
      return new NextResponse("Template name and styles are required", { status: 400 });
    }

    const customization = await prisma.customization.upsert({
      where: {
        resumeId_templateName: {
          resumeId: resumeId,
          templateName: templateName,
        },
      },
      update: {
        styles: styles,
      },
      create: {
        resumeId: resumeId,
        templateName: templateName,
        styles: styles,
      },
    });

    return NextResponse.json(customization, { status: 200 });
  } catch (error) {
    console.error("Error saving customization:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
