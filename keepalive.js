import https from "https";

const URL = "https://ar-learning-backend.onrender.com/";
const INTERVAL = 1 * 60 * 1000; // 1 minute

var interations = 0;

function pingServer() {
  https
    .get(URL, (res) => {
      interations++;
      console.log("Number of iterations : " + interations);
      console.log(`[${new Date().toISOString()}] Ping sent - Status: ${res.statusCode}`);
    })
    .on("error", (err) => {
      console.error(`[${new Date().toISOString()}] Error:`, err.message);
    });
}

// Initial call
pingServer();

// Repeat
setInterval(pingServer, INTERVAL);