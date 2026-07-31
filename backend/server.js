require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { connectToDatabase } = require("./db/client");
const { startCronScheduler } = require("./services/cronScheduler");

const healthRouter = require("./routes/health");
const seoRouter = require("./routes/seo");
const auditRouter = require("./routes/audit");
const historyRouter = require("./routes/history");
const analyticsRouter = require("./routes/analytics");
const positionRouter = require("./routes/position");
const competitorRouter = require("./routes/competitor");
const assistantRouter = require("./routes/assistant");
const contentRouter = require("./routes/content");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Console logging middleware for HTTP requests
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`\n========================================`);
  console.log(`[HTTP INCOMING] ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.query).length) console.log(`[HTTP QUERY]`, JSON.stringify(req.query));
  if (req.body && Object.keys(req.body).length) console.log(`[HTTP BODY]`, JSON.stringify(req.body));
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[HTTP OUTGOING] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
    console.log(`========================================\n`);
  });
  next();
});

// Register all route modules
app.use("/api", healthRouter);
app.use("/api", seoRouter);
app.use("/api", auditRouter);
app.use("/api/history", historyRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/position", positionRouter);
app.use("/api/competitor", competitorRouter);
app.use("/api/assistant", assistantRouter);
app.use("/api/content", contentRouter);

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/seo_dashboard";

global.useMemoryDb = false;
global.memoryDb = {
  seoRecords: new Map(),
  gbpRecords: new Map(),
};

async function main() {
  console.log("\n📡 Initializing Database Connections...");
  console.log(`Connecting to MongoDB URI: ${mongoUri}`);
  
  // 1. Connect native MongoDB client pool
  try {
    await connectToDatabase();
    console.log("✅ Native MongoClient pool connected successfully!");
  } catch (err) {
    console.warn("⚠️ Native MongoClient connection failed:", err.message);
  }

  // 2. Connect Mongoose
  mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log(`✅ Mongoose connected to MongoDB database: ${mongoose.connection.name}`);
      startServer();
    })
    .catch((err) => {
      console.warn("⚠️ Mongoose Connection Failed:", err.message);
      console.warn("🚀 MongoDB offline. Falling back to in-memory mock database mode.");
      global.useMemoryDb = true;
      startServer();
    });
}

function startServer() {
  startCronScheduler();
  app.listen(PORT, () => {
    console.log(`🚀 SEO Dashboard Backend running on http://127.0.0.1:${PORT}`);
  });
}

main();
