import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (file.type === "application/pdf") {
      const pdf = (await import("pdf-parse")).default;
      const data = await pdf(buffer);
      extractedText = data.text;
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ arrayBuffer: buffer.buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json({ message: "Unsupported file type" }, { status: 400 });
    }

    if (!extractedText) {
      return NextResponse.json({ message: "Could not extract text from file" }, { status: 400 });
    }

    // Use Gemini to parse the extracted text into structured data
    const prompt = `Extract the following information from the resume text below in JSON format. Ensure all fields are present, using null if information is not found. Dates should be in YYYY-MM-DD format. If a date is ongoing, use null for endDate.\n\nResume Text:\n"""\n${extractedText}\n"""\n\nJSON Format Expected:\n{\n  "personalInfo": {\n    "fullName": "string",\n    "email": "string",\n    "phone": "string | null",\n    "address": "string | null",\n    "linkedin": "string | null",\n    "github": "string | null",\n    "portfolio": "string | null",\n    "summary": "string | null"\n  },\n  "experiences": [\n    {\n      "title": "string",\n      "company": "string",\n      "location": "string | null",\n      "startDate": "YYYY-MM-DD",\n      "endDate": "YYYY-MM-DD | null",\n      "description": "string | null"\n    }\n  ],\n  "educations": [\n    {\n      "institution": "string",\n      "degree": "string",\n      "fieldOfStudy": "string | null",\n      "startDate": "YYYY-MM-DD",\n      "endDate": "YYYY-MM-DD | null",\n      "description": "string | null"\n    }\n  ],\n  "skills": [\n    {\n      "name": "string",\n      "level": "string | null"\n    }\n  ]\n}\n`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse the Gemini response as JSON
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (jsonError) {
      console.error("Failed to parse Gemini response as JSON:", jsonError);
      return new NextResponse("Failed to parse AI response", { status: 500 });
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Error importing resume:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}