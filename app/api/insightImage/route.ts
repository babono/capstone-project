import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  const { chartImage } = await request.json();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

  try {
    const result = await model.generateContent([
        {
            inlineData: {
                data: chartImage,
                mimeType: "image/jpeg",
            },
        },
        'Interpret this chart and provide insights.',
    ]);
    return NextResponse.json({ response: result.response.text() });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}