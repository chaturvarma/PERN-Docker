import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import sequelize from "./app/config/sequelize.js";
import prometheus from "prom-client";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

prometheus.collectDefaultMetrics({
  timeout: 5000,
});

const httpRequests = new prometheus.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDuration = new prometheus.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [1, 2, 5, 6, 10],
});

const dbQueryDuration = new prometheus.Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["query_type"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
});

const activeSessions = new prometheus.Gauge({
  name: "active_sessions",
  help: "Number of active user sessions",
});

const memoryUsageSummary = new prometheus.Summary({
  name: "memory_usage_bytes",
  help: "Memory usage in bytes",
  labelNames: ["memory_type"],
});

export { dbQueryDuration, activeSessions };

setInterval(() => {
  const memoryUsage = process.memoryUsage();
  memoryUsageSummary.observe(
    { memory_type: "heap_used" },
    memoryUsage.heapUsed
  );
  memoryUsageSummary.observe(
    { memory_type: "heap_total" },
    memoryUsage.heapTotal
  );
}, 5000);

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    end({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });
    httpRequests.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });
  });
  next();
});

app.use(express.json());
app.use(cookieParser());

app.get("/db-test", async (req, res) => {
  try {
    await sequelize.authenticate();
    res
      .status(200)
      .json({ message: "Database connection established successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to connect to the database",
      error: error.message,
    });
  }
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is Running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});