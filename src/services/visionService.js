import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const analyzeImage = async (imageBuffer) => {

  const imageBase64 = imageBuffer.toString("base64");

  // -----------------------------
  // STEP 1: IDENTIFY CONCEPT
  // -----------------------------

  const analysisResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
You are an AI assistant for an educational AR learning platform.

Users capture images from textbooks or diagrams.

If NOT educational, return:
{
 "label": "Unsupported Content",
 "description": "Please scan educational material."
}

Otherwise return:
{
 "label": "",
 "description": ""
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
    config: { responseMimeType: "application/json" }
  });

  let parsed;

  try {
    parsed = JSON.parse(analysisResponse.text);
  } catch {
    parsed = {
      label: "Unknown Concept",
      description: "The educational concept could not be identified."
    };
  }

  const label = parsed.label || "Unknown Concept";

  if (label === "Unsupported Content") {
    return {
      label,
      description: parsed.description,
      images: []
    };
  }

  // -----------------------------
  // STEP 2: GENERATE HERO DIAGRAM
  // -----------------------------

  let generatedImage = null;

  try {

    const generationResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [{
            text: `
A professional textbook-style educational diagram of ${label}.
Landscape orientation.
1920x1080 resolution.
White background.
Clearly labeled parts.
Minimalist scientific style.
No artistic effects.
`
          }]
        }
      ],
      config: {
        responseModalities: ["IMAGE"]
      }
    });

    const imagePart = generationResponse
      ?.candidates?.[0]?.content?.parts
      ?.find(p => p.inlineData);

    if (imagePart) {
      generatedImage = `data:image/jpeg;base64,${imagePart.inlineData.data}`;
    }

  } catch (err) {
    console.error("Gemini image generation failed:", err);
  }

  // -----------------------------
  // STEP 3: UNSPLASH REFERENCES
  // -----------------------------

  const cleanedLabel = label
  .replace(/diagram/gi, "")
  .replace(/chart/gi, "")
  .replace(/illustration/gi, "")
  .trim();

  const refinedQuery = `${cleanedLabel} educational diagram`;

  let referenceImages = [];

  try {

    const unsplashURL =
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(refinedQuery)}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=5`;

    const response = await fetch(unsplashURL);

    if (response.ok) {
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        referenceImages = data.results.map(img => img.urls.small);
      }
    }

  } catch (err) {
    console.error("Unsplash fetch failed:", err);
  }

  // -----------------------------
  // STEP 4: COMBINE IMAGES
  // -----------------------------

  let images = [];

  if (generatedImage) {
    images.push(generatedImage);   // Hero image first
  }

  images = images.concat(referenceImages);

  // Final safety fallback
  if (images.length === 0) {
    images = [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Example.jpg/640px-Example.jpg"
    ];
  }

  return {
    label,
    description: parsed.description,
    images
  };
};