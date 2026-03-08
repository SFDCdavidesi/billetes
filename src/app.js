const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const banknotesRouter = require("./routes/banknotes");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/banknotes", banknotesRouter);

// Serve the main HTML page for any unmatched route
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;
