import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const MAX_RETRIES = 3;
    let retries = 0;
    let result;

    while (retries < MAX_RETRIES) {
      try {
        result = await model.generateContent(prompt);
        break; // If successful, break the loop
      } catch (error: any) {
        if (error.response && error.response.status === 503) {
          console.warn(`Gemini service overloaded, retrying... (${retries + 1}/${MAX_RETRIES})`);
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        } else {
          throw error; // Re-throw other errors immediately
        }
      }
    }

    if (!result) {
      return new NextResponse("Failed to generate content after multiple retries", { status: 500 });
    }

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
