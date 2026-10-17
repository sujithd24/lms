import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./db";
import seed from "./seed/seed";
import {
  createClerkClient,
  requireAuth,
} from "@clerk/express";
/* ROUTE IMPORTS */
import courseRoutes from "./routes/courseRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import userCourseProgressRoutes from "./routes/userCourseProgressRoutes";
import  jsonRoutes  from "./routes/jsonfile";

/* CONFIGURATIONS */
dotenv.config();

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});


const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Tolerate common typos in the env value: spaces after commas, trailing slashes
const normalizeOrigin = (o: string) => o.trim().replace(/\/+$/, "");
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:3001,http://localhost:3000"
)
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        callback(null, true);
      } else {
        // No CORS headers instead of a 500 error page; the log says which origin to add
        console.warn(`CORS blocked origin: ${origin} (add it to ALLOWED_ORIGINS)`);
        callback(null, false);
      }
    },
    credentials: true,
  })
);

/* ROUTES */
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/courses", courseRoutes);
app.use("/users/clerk", requireAuth(), userClerkRoutes);
app.use("/transactions", transactionRoutes);
app.use("/users/course-progress", requireAuth(), userCourseProgressRoutes);
app.use("/api", jsonRoutes);

/* SERVER */
const port = process.env.PORT || 8001;

// Only listen when not in Lambda environment
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  connectDB()
    .then(async () => {
      // Optional: load sample data, but only into EMPTY collections (never wipes data)
      if (process.env.SEED_ON_START === "true") {
        await seed().catch((error) => console.error("Seeding failed:", error));
      }
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Could not connect to MongoDB:", error.message);
      process.exit(1);
    });
}

// aws lambda production environment
import serverless from "serverless-http";
const serverlessApp = serverless(app);
export const handler = async (event: any, context: any) => {
  await connectDB(); // reused across warm invocations
  if (event.action === "seed") {
    await seed();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data seeded successfully" }),
    };
  } else {
    return serverlessApp(event, context);
  }
};
