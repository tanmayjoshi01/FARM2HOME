const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

