import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateEducationalResponse = async ({ question, domain }) => {
  try {
    const systemInstruction = `
You are an educational AI assistant.

Rules:
- Respond ONLY in JSON
- No markdown
- Answer only within "${domain}"

Format:
{
  "title": "",
  "explanation": "",
  "keyPoints": []
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: question,
      config: {
        systemInstruction,
        temperature: 1.0,
      },
    });

    try {
      return JSON.parse(response.text);
    } catch {
      return {
        title: "Format Error",
        explanation: "AI response could not be parsed.",
        keyPoints: [],
      };
    }

  } catch(err) {
    console.error("FULL GEMINI ERROR:", err);
    throw err;
  }
};