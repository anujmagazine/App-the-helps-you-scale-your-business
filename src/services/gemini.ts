import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ScalingAnalysis {
  businessModel: string;
  customerJourneys: {
    title: string;
    content: string;
  }[];
  scalingBlockers: {
    title: string;
    priority: "High" | "Medium" | "Low";
  }[];
  actionableIdeas: {
    title: string;
    description: string;
    impact: "High" | "Medium" | "Low";
    probabilityOfSuccess: string;
    whyItMightFail: string;
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
         - MANDATORY: Each revenue stream MUST be a separate bullet point on its own line (starting with "- ").
         - NEVER use inline separators like "*" or "•" to separate points.
         - Use bold headers for each section.
         - Ensure there is a blank line between the header and the list.
         - Avoid long paragraphs. Use short, punchy sentences.
      
      2. Explain with 3 prominent Customer Journeys: Provide scenarios for different types of customers or use cases.
         - For each journey, provide a descriptive title (e.g., "The Enterprise Buyer", "The Self-Serve User").
         - Break each journey into clear, bulleted steps or stages (e.g., Discovery, Engagement, Value Delivery, Expansion).
         - Each stage MUST be its own bullet point on its own line (starting with "- ").
         - Ensure there is a blank line between the header and the list.
         - Make it highly readable and structured.
      
      3. Identify Scaling Blockers: What is preventing this business from scaling from 1 to 100?
         - Provide AT LEAST 5 distinct blockers.
         - Order them from highest priority (High) to lowest priority (Low).
         - For each blocker, assign a priority (High, Medium, Low).
      
      4. Suggest 5+ Actionable Ideas: Provide specific, high-impact strategies.
         - For each idea, provide:
           - Probability of success (e.g., "80%")
           - Why it might fail (potential risks or dependencies)
      
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
      systemInstruction: "You are a business scaling expert. Always format lists using proper Markdown bullet points (starting with '- ' on a new line). Never use inline separators like '*' or '•' for lists. Always use double newlines between headers and lists for maximum readability.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          businessModel: { type: Type.STRING },
          customerJourneys: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ["title", "content"],
            },
          },
          scalingBlockers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              },
              required: ["title", "priority"],
            },
          },
          actionableIdeas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                probabilityOfSuccess: { type: Type.STRING },
                whyItMightFail: { type: Type.STRING },
              },
              required: ["title", "description", "impact", "probabilityOfSuccess", "whyItMightFail"],
            },
          },
        },
        required: ["businessModel", "customerJourneys", "scalingBlockers", "actionableIdeas"],
      },
      tools: url ? [{ urlContext: {} }] : undefined,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as ScalingAnalysis;
}
