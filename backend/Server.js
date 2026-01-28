import express from "express";
import cors from "cors";
import pool from "./Configure/db.js";
import authRoute from "./Routes/route.js";
import dotenv from "dotenv"; //  new line
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config(); //Load .env file

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.json());
app.use(cors({ origin: "http://174.129.55.24:81" }));


// Mount all routes at /api (for /api/comments, /api/incidents, etc)
app.use("/api", authRoute);
// Optionally keep this if you want /api/auth/... to also work
app.use("/api/auth", authRoute);

app.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM user");
    res.json(rows);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});