import "./src/config/env.js";

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { requestLogger } from "./src/middleware/logger.js";
import chatRoutes from "./src/routes/chatRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AR Learning Backend Running!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});