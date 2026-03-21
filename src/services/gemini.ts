import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ScalingAnalysis {
  businessModel: {
    valueProposition: string;
    targetSegments: string;
    revenueStreams: string;
    costStructure: string;
    distributionChannels: string;
    competitiveMoat: string;
  };
  example: string;
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
      
      1. Deep Business Model Deconstruction:
         - Value Proposition: What is the core problem being solved and the unique value delivered?
         - Target Customer Segments: Who is the Ideal Customer Profile (ICP)?
         - Revenue Streams: Exactly how does the business make money? (Pricing models, recurring vs one-off).
         - Cost Structure: What are the primary drivers of fixed and variable costs? Will costs scale linearly or exponentially?
         - Distribution Channels: How does the business acquire customers? (GTM motion, sales, marketing channels).
         - Competitive Moat: What makes this business defensible? (Network effects, IP, high switching costs).
         
         MANDATORY: For each dimension, use short, punchy sentences and proper Markdown bullet points where appropriate.
      
      2. Explain with a concrete example: Provide a scenario of a single transaction or customer journey.
         - MANDATORY: Break the journey into clear, bulleted steps or stages (e.g., Discovery, Engagement, Value Delivery, Expansion).
         - Each stage MUST be its own bullet point on its own line (starting with "- ").
      
      3. Identify Scaling Blockers: What is preventing this business from scaling from 1 to 100?
         - For each blocker, assign a priority (High, Medium, Low).
      
      4. Suggest 5 Top Actionable Ideas: Provide specific, high-impact strategies to achieve 1-100 scaling.
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
          businessModel: {
            type: Type.OBJECT,
            properties: {
              valueProposition: { type: Type.STRING },
              targetSegments: { type: Type.STRING },
              revenueStreams: { type: Type.STRING },
              costStructure: { type: Type.STRING },
              distributionChannels: { type: Type.STRING },
              competitiveMoat: { type: Type.STRING },
            },
            required: ["valueProposition", "targetSegments", "revenueStreams", "costStructure", "distributionChannels", "competitiveMoat"],
          },
          example: { type: Type.STRING },
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
        required: ["businessModel", "example", "scalingBlockers", "actionableIdeas"],
      },
      tools: url ? [{ urlContext: {} }] : undefined,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as ScalingAnalysis;
}
