const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/env");
const { testConnection } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

async function start() {
  await testConnection();

  app.listen(config.port, () => {
    console.log(`Backend listening on http://localhost:${config.port}`);
  });
}

start();

