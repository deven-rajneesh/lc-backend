
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Middlewares
app.use(cors({
    origin: FRONTEND_URL,
}));

// Routes
import courseRoutes from "./routes/course.routes.js";


app.use(express.json());

// Health Check Route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Classplus Video Collector Backend is running",
    });
});

const courseLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many video requests. Please wait a minute and try again.",
    },
});

app.use("/api/courses", courseLimiter, courseRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}); 
