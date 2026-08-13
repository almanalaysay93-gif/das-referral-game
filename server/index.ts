import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/16d7XR_Rt22sl9xE4GBWTiVdZraNOCbONdTevq6fF7Xk/edit#gid=0";
const TARGET_SHEET_ID = "16d7XR_Rt22sl9xE4GBWTiVdZraNOCbONdTevq6fF7Xk";

const DATA_DIR = path.resolve(__dirname, "data");
const SCORES_FILE = path.join(DATA_DIR, "scores.json");
const CSV_FILE = path.join(DATA_DIR, "scores.csv");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(SCORES_FILE)) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify([]));
}
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(
    CSV_FILE,
    "Timestamp,FullName,Profession,LevelName,Score,Total,Percentage,Streak\n",
  );
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // API Route: Get target Google Sheet info
  app.get("/api/sheet-info", (_req, res) => {
    res.json({
      sheetUrl: TARGET_SHEET_URL,
      sheetId: TARGET_SHEET_ID,
      webhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL || "",
    });
  });

  // API Route: Log shift score to local JSON/CSV + Google Sheets Webhook if configured
  app.post("/api/log-score", async (req, res) => {
    try {
      const entry = req.body;
      const timestamp = entry.timestamp || new Date().toISOString();
      const record = {
        id: entry.id || "log_" + Date.now(),
        timestamp,
        fullName: entry.fullName || "Clinician Operator",
        profession: entry.profession || "Transplant Coordinator",
        levelName: entry.levelName || "Hospital Ward",
        score: Number(entry.score) || 0,
        total: Number(entry.total) || 10,
        percentage: Number(entry.percentage) || 0,
        streak: Number(entry.streak) || 0,
      };

      // 1. Append to local JSON
      let scores = [];
      try {
        const content = fs.readFileSync(SCORES_FILE, "utf-8");
        scores = JSON.parse(content);
      } catch {
        scores = [];
      }
      scores.unshift(record);
      fs.writeFileSync(SCORES_FILE, JSON.stringify(scores.slice(0, 500), null, 2));

      // 2. Append to local CSV
      const csvLine = `"${record.timestamp}","${record.fullName}","${record.profession}","${record.levelName}",${record.score},${record.total},"${record.percentage}%",${record.streak}\n`;
      fs.appendFileSync(CSV_FILE, csvLine);

      // 3. Forward to Google Sheets Webhook URL if set
      let webhookSuccess = false;
      const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || entry.sheetsWebhookUrl;
      if (webhookUrl && webhookUrl.startsWith("http")) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record),
          });
          webhookSuccess = true;
        } catch (err) {
          console.warn("Failed to post to Google Sheets Webhook:", err);
        }
      }

      res.json({ success: true, record, webhookSuccess });
    } catch (err) {
      console.error("Score logging error:", err);
      res.status(500).json({ success: false, error: String(err) });
    }
  });

  // API Route: Get recorded scores
  app.get("/api/scores", (_req, res) => {
    try {
      const content = fs.readFileSync(SCORES_FILE, "utf-8");
      res.json(JSON.parse(content));
    } catch {
      res.json([]);
    }
  });

  // API Route: Download CSV matching Google Sheet columns
  app.get("/api/scores/csv", (_req, res) => {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="das-referral-scores.csv"');
    res.sendFile(CSV_FILE);
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
