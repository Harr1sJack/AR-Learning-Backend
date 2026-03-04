import { analyzeImage } from "../services/visionService.js";

export const handleVision = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file required",
      });
    }

    const imageBuffer = req.file.buffer;

    const result = await analyzeImage(imageBuffer);

    res.json(result);

  } catch (error) {
    console.error("Vision Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "Vision processing failed",
    });
  }
};