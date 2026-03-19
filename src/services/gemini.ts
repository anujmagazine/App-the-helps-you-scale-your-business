import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ScalingAnalysis {
  businessModel: string;
  example: string;
  scalingBlockers: string[];
  actionableIdeas: {
    title: string;
    description: string;
    impact: "High" | "Medium" | "Low";
  }[];
}

export async function analyzeBusiness(
  url?: string,
  pdfBase64?: string,
  pdfMimeType?: string
): Promise<ScalingAnalysis> {
  const parts: any[] = [
    {
      text: `Analyze the following business information (from a website URL or a PDF document).
      
      1. Deconstruct the business model: How does this company earn money? What are the primary revenue streams?
      2. Explain with a concrete example: Provide a scenario of a single transaction or customer journey.
      3. Identify Scaling Blockers: What is preventing this business from scaling from 1 to 100? (e.g., operational bottlenecks, market saturation, technical debt, etc.)
      4. Suggest 5+ Actionable Ideas: Provide specific, high-impact strategies to overcome these blockers and achieve massive scale.
      
      Return the response in JSON format.`,
    },
  ];

  if (url) {
    parts.push({ text: `Website URL: ${url}` });
  }

  if (pdfBase64 && pdfMimeType) {
    parts.push({
      inlineData: {
        data: pdfBase64,
        mimeType: pdfMimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          businessModel: { type: Type.STRING },
          example: { type: Type.STRING },
          scalingBlockers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          actionableIdeas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              },
              required: ["title", "description", "impact"],
            },
          },
        },
        required: ["businessModel", "example", "scalingBlockers", "actionableIdeas"],
      },
      tools: url ? [{ urlContext: {} }] : undefined,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as ScalingAnalysis;
}
