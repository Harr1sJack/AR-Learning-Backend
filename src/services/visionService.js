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
You are an AI visual recognition system.

Identify the main subject of the image.

The image may contain:
- real objects
- educational diagrams
- labeled illustrations
- anatomy charts
- printed images

Return ONLY JSON in this format:

{
 "label": "",
 "description": ""
}

Example:

{
 "label": "Human Brain",
 "description": "The human brain is the central organ of the nervous system responsible for cognition, memory, and controlling body functions."
}
`
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
  const rawText = response.text;

  console.log("Gemini raw response:");
  console.log(rawText);

  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("No JSON found");
    }

  } catch (error) {
    console.error("JSON parse failed:", error);

    parsed = {
      label: "Unknown Object",
      description: "The object could not be identified clearly.",
    };
  }

  const label = parsed.label;

  // Better search query
  const searchQuery = `${label} educational diagram`;

  const unsplashURL =
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=1`;

  const imageResponse = await fetch(unsplashURL);
  const imageData = await imageResponse.json();

  let imageUrl = "";

  if (imageData.results && imageData.results.length > 0) {
    imageUrl = imageData.results[0].urls.regular;
  }

  return {
    label,
    description: parsed.description,
    imageUrl,
  };
};