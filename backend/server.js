require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Next.js app (running on localhost:3000)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Middleware to parse incoming JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use("/api", require("./routes/seo"));

// Database Connection
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/seo_dashboard";

// Setup global mock memory database fallback in case MongoDB is offline
global.useMemoryDb = false;
global.memoryDb = {
  seoRecords: new Map(),
  gbpRecords: new Map(),
};

console.log("Connecting to MongoDB database...");
mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 5000 }) // Fail fast (5s) if MongoDB is not running
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    startServer();
  })
  .catch((err) => {
    console.warn("⚠️ MongoDB Connection Failed:", err.message);
    console.warn("🚀 MongoDB offline. Falling back to in-memory mock database mode.");
    global.useMemoryDb = true;
    startServer();
  });

function startServer() {
  app.listen(PORT, () => {
    console.log(`SEO Dashboard Backend running on http://127.0.0.1:${PORT}`);
    if (global.useMemoryDb) {
      console.log("⚠️ Running with in-memory persistence. Restarts will clear memory records.");
    }
  });
}
