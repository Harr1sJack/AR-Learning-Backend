import { generateEducationalResponse } from "../services/geminiService.js";

const allowedDomains = ["water_cycle", "brain", "solar_system", "lungs", "larynx"];

export const handleChat = async (req, res) => {
  try {
    const { question, domain } = req.body;

    if (!question || !domain) {
      console.log("Missing question/domain");
      return res.status(400).json({
        success: false,
        message: "Question and domain are required.",
      });
    }

    if (!allowedDomains.includes(domain.toLowerCase())) {
      console.log("Invalid domain:", domain);
      return res.status(400).json({
        success: false,
        message: "Invalid learning module.",
      });
    }

    const aiResponse = await generateEducationalResponse({
      question,
      domain,
    });

    const finalResponse = {
      success: true,
      data: aiResponse,
    };

    console.log("\n--- SERVER RESPONSE ---");
    console.log(JSON.stringify(finalResponse, null, 2));
    console.log("-----------------------\n");

    res.json(finalResponse);

  } catch (error) {
    console.error("Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "AI processing failed.",
    });
  }
};