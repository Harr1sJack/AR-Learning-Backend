export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { question, domain } = req.body || {};

  console.log("\n==============================");
  console.log("Incoming Request");
  console.log("Time:", timestamp);
  console.log("IP:", req.ip);
  console.log("Route:", req.originalUrl);
  console.log("Domain:", domain);
  console.log("Question Length:", question ? question.length : 0);
  console.log("==============================\n");

  next();
};