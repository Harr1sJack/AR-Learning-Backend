import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateEducationalResponse = async ({ question, domain }) => {
  try {
    const systemInstruction = `
You are an educational AI assistant for an AR-Based Interactive Learning Platform.

Rules:
- Respond ONLY in valid JSON.
- Do NOT include markdown.
- Do NOT include extra commentary.
- Only answer within the domain of "${domain}".
- If the question is unrelated to "${domain}", respond with:
{
  "error": "Question is outside the current learning module."
}

Return JSON in exactly this format:

{
  "title": "",
  "explanation": "",
  "keyPoints": []
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction,
        temperature: 1.0,
      },
    });

    const rawText = response.text;
    
    try {
      return JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON Parse Failed. Raw Response:", rawText);

      return {
        title: "Response Formatting Error",
        explanation: "The AI response could not be structured properly.",
        keyPoints: [],
      };
    }

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw new Error("Failed to generate AI response.");
  }
};