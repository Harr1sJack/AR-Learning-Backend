import { generateEducationalResponse } from "../services/geminiService.js";

const allowedDomains = ["heart", "brain", "solar_system"];

export const handleChat = async (req, res) => {
  try {
    const { question, domain } = req.body;

    if (!question || !domain) {
      return res.status(400).json({
        success: false,
        message: "Question and domain are required.",
      });
    }

    if (!allowedDomains.includes(domain.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid learning module.",
      });
    }

    const aiResponse = await generateEducationalResponse({
      question,
      domain,
    });

    res.json({
      success: true,
      data: aiResponse,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "AI processing failed.",
    });
  }
};