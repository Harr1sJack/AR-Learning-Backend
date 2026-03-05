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
You are an AI assistant for an educational AR learning platform.

Users will capture images from textbooks or educational diagrams.

Allowed educational domains:
- biology
- anatomy
- astronomy
- physics
- engineering diagrams
- science illustrations

If the image is NOT educational (for example: people, animals, furniture, random objects),
return this JSON:

{
 "label": "Unsupported Content",
 "description": "The captured image does not appear to be educational material. Please scan a textbook diagram or learning content."
}

Otherwise identify the concept.

Return ONLY JSON:

{
 "label": "",
 "description": ""
}

Example:

{
 "label": "Solar System",
 "description": "A diagram showing the Sun at the center with planets orbiting around it."
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

  const rawText = response.text;

  console.log("Gemini raw response:", rawText);

  let parsed;

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
      label: "Unknown Concept",
      description: "The educational concept could not be identified.",
    };
  }

  const label = parsed.label;

  if (label === "Unsupported Content") {
    return {
      label,
      description: parsed.description,
      images: [],
    };
  }

  // Clean label for searching
  const searchQuery = label
    .replace(/diagram/gi, "")
    .replace(/chart/gi, "")
    .replace(/illustration/gi, "")
    .trim();

  const queries = [
    `${searchQuery} educational diagram`,
    `${searchQuery}`,
    `${searchQuery} diagram`
  ];

  let images = [];

  for (const q of queries) {

    const url =
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=8`;

    try {

      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {

        images = data.results.slice(0,8).map(img => img.urls.small);

        console.log("Unsplash images found using query:", q);

        break;
      }

    } catch (err) {

      console.error("Unsplash fetch error:", err);

    }
  }

  // Fallback images if Unsplash fails
  if (images.length === 0) {

    console.log("Unsplash returned no results, using fallback images");

    images = [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Example.jpg/640px-Example.jpg"
    ];
  }

  return {
    label,
    description: parsed.description,
    images,
  };
};