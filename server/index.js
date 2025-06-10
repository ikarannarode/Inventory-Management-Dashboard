import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());

// Database connection status
let isDbConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log(mongoUri);
    await mongoose.connect(mongoUri);

    console.log("Connected to MongoDB...");
    isDbConnected = true;
  } catch (error) {
    console.log("MongoDB connection failed");

    isDbConnected = false;
  }
};

// Connect to database
connectDB();

// Middleware to check database connection
const checkDbConnection = (req, res, next) => {
  if (!isDbConnected) {
    return res.status(503).json({
      message: "Database not available - running in offline mode",
      error: "DATABASE_OFFLINE",
    });
  }
  next();
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: isDbConnected ? "connected" : "offline",
    timestamp: new Date().toISOString(),
  });
});

// Routes with database check
app.use("/api/auth", checkDbConnection, authRoutes);
app.use("/api/products", checkDbConnection, productRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!isDbConnected) {
    console.log("Database is offline. API endpoints will return 503 status.");
  }
});
