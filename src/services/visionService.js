import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const analyzeImage = async (imageBuffer) => {

  const imageBase64 = imageBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
Identify the main object in this image.

Return ONLY JSON in this format:

{
 "label": "",
 "description": ""
}
`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ],
  });

  let parsed;

  try {
    parsed = JSON.parse(response.text);
  } catch {
    parsed = {
      label: "Unknown Object",
      description: "The object could not be identified clearly.",
    };
  }

  const label = parsed.label;

  const unsplashURL = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    label
  )}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=1`;

  const imageResponse = await fetch(unsplashURL);
  const imageData = await imageResponse.json();

  let imageUrl = "";

  if (imageData.results.length > 0) {
    imageUrl = imageData.results[0].urls.regular;
  }

  return {
    label,
    description: parsed.description,
    imageUrl,
  };
};