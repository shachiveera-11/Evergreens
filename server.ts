import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("evergreens.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT, -- 'admin' or 'influencer'
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    influencer_id INTEGER,
    title TEXT,
    description TEXT,
    reels_count INTEGER,
    demographics TEXT,
    expected_reach TEXT,
    budget TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    progress TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(influencer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    influencer_id INTEGER,
    date TEXT,
    time TEXT,
    mode TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(influencer_id) REFERENCES users(id)
  );
`);

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(
    "admin@evergreens.com",
    "admin123",
    "admin",
    "Evergreens Admin"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes (Simplified for demo)
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json({ success: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, name, role } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(
        email, password, name, role || 'influencer'
      );
      res.json({ success: true, userId: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ success: false, message: "Email already exists" });
    }
  });

  // Proposal Routes
  app.post("/api/proposals", (req, res) => {
    const { influencerId, title, description, reelsCount, demographics, expectedReach, budget } = req.body;
    const result = db.prepare(`
      INSERT INTO proposals (influencer_id, title, description, reels_count, demographics, expected_reach, budget)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(influencerId, title, description, reelsCount, demographics, expectedReach, budget);
    res.json({ success: true, proposalId: result.lastInsertRowid });
  });

  app.get("/api/proposals", (req, res) => {
    const { role, userId } = req.query;
    let proposals;
    if (role === 'admin') {
      proposals = db.prepare(`
        SELECT p.*, u.name as influencer_name 
        FROM proposals p 
        JOIN users u ON p.influencer_id = u.id 
        ORDER BY p.created_at DESC
      `).all();
    } else {
      proposals = db.prepare("SELECT * FROM proposals WHERE influencer_id = ? ORDER BY created_at DESC").all(userId);
    }
    res.json(proposals);
  });

  app.patch("/api/proposals/:id", (req, res) => {
    const { id } = req.params;
    const { status, progress } = req.body;
    if (status) {
      db.prepare("UPDATE proposals SET status = ? WHERE id = ?").run(status, id);
    }
    if (progress) {
      db.prepare("UPDATE proposals SET progress = ? WHERE id = ?").run(progress, id);
    }
    res.json({ success: true });
  });

  // Meeting Routes
  app.post("/api/meetings", (req, res) => {
    const { influencerId, date, time, mode } = req.body;
    const result = db.prepare(`
      INSERT INTO meetings (influencer_id, date, time, mode)
      VALUES (?, ?, ?, ?)
    `).run(influencerId, date, time, mode);
    res.json({ success: true, meetingId: result.lastInsertRowid });
  });

  app.get("/api/meetings", (req, res) => {
    const { role, userId } = req.query;
    let meetings;
    if (role === 'admin') {
      meetings = db.prepare(`
        SELECT m.*, u.name as influencer_name 
        FROM meetings m 
        JOIN users u ON m.influencer_id = u.id 
        ORDER BY m.created_at DESC
      `).all();
    } else {
      meetings = db.prepare("SELECT * FROM meetings WHERE influencer_id = ? ORDER BY created_at DESC").all(userId);
    }
    res.json(meetings);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
