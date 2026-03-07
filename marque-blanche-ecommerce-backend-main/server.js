// load env-vars
require("dotenv").config();

// requiring dependencies
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// initialize express
const app = express();

// requiring routers
const paymentRouter = require("./routes/paymentRouter");
const productRouter = require("./routes/productRouter");
const adminRouter = require("./routes/adminRouter");
const orderRouter = require("./routes/orderRouter");
const uploadRouter = require("./routes/uploadRouter");
const categoryRouter = require("./routes/categoryRouter");
const heroImageRouter = require("./routes/heroImageRouter");
const platformReviewRouter = require("./routes/platformReviewRouter");
const siteSettingsRouter = require("./routes/siteSettingsRouter");
const clientRouter = require("./routes/clientRouter");
const promotionRouter = require("./routes/promotionRouter");
const reportRouter = require("./routes/reportRouter");
const notificationRouter = require("./routes/notificationRouter");
const cartRouter = require("./routes/cartRouter");
const searchRouter = require("./routes/searchRouter");
const aiRouter = require("./routes/aiRouter");

// requiring middlewares
const errorMiddleware = require("./middleware/Error");

// require db configs
const connectToDb = require("./config/db");

// require cloudinary configs
const cloudinary = require("./config/cloudinary");

// uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server shutting down due to uncaught exception`);
  process.exit(1);
});

// connect to db
connectToDb();

// Initialize Meilisearch index (non-blocking)
const { configureIndex } = require("./config/meilisearch");
configureIndex().catch((err) =>
  console.warn("⚠️  Meilisearch init skipped:", err.message)
);

// using middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ── Rate limiting ────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, message: "Trop de requêtes, veuillez réessayer plus tard" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: "Trop de tentatives de connexion, réessayez dans 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/admin/login", authLimiter);
app.use("/api/clients/login", authLimiter);

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { success: false, message: "Trop d'inscriptions, réessayez plus tard" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/clients/register", registerLimiter);

// basic api route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API service running 🚀",
  });
});

// using routers
app.use("/api/payment", paymentRouter);
app.use("/api/products", productRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/hero-images", heroImageRouter);
app.use("/api/platform-reviews", platformReviewRouter);
app.use("/api/settings", siteSettingsRouter);
app.use("/api/clients", clientRouter);
app.use("/api/promotions", promotionRouter);
app.use("/api/reports", reportRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/cart", cartRouter);
app.use("/api/search", searchRouter);
app.use("/api/ai", aiRouter);

// using other middlewares
app.use(errorMiddleware);

// starting server
const server = app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server shutting down due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});
