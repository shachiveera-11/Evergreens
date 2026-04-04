import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup with fallback for serverless environments
let db: any = {
  prepare: (sql: string) => ({
    run: () => ({ lastInsertRowid: Date.now() }),
    get: (email: string) => {
      if (email === "connect.evergreens@gmail.com" || email === "connect.evergreen@gmail.com") {
        return { id: 1, email, password: "admin123", role: "admin", name: "Akshat" };
      }
      return null;
    },
    all: () => []
  }),
  exec: () => {}
};

async function initDb() {
  if (process.env.VERCEL) {
    console.log("[Database] Running on Vercel - Using Mock Database for stability");
    return;
  }
  
  try {
    const { default: Database } = await import("better-sqlite3");
    const dbPath = path.join(process.cwd(), "evergreens.db");
    db = new Database(dbPath);
    console.log(`[Database] Connected to ${dbPath}`);
    
    // Initialize Tables
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
        influencer_name TEXT,
        influencer_email TEXT,
        platform_handle TEXT,
        followers_count INTEGER,
        description TEXT,
        reels_count INTEGER,
        expected_reach INTEGER,
        budget INTEGER,
        status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        progress TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
        reel_link TEXT,
        content_url TEXT,
        actual_reach INTEGER,
        performance_insights TEXT,
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

    // Ensure columns exist for existing databases
    try { db.prepare("ALTER TABLE proposals ADD COLUMN reel_link TEXT").run(); } catch(e) {}
    try { db.prepare("ALTER TABLE proposals ADD COLUMN content_url TEXT").run(); } catch(e) {}
    try { db.prepare("ALTER TABLE proposals ADD COLUMN actual_reach INTEGER").run(); } catch(e) {}
    try { db.prepare("ALTER TABLE proposals ADD COLUMN performance_insights TEXT").run(); } catch(e) {}

    // Seed Admin if not exists
    const adminEmails = ["connect.evergreens@gmail.com", "connect.evergreen@gmail.com"];
    adminEmails.forEach(email => {
      const requestedAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!requestedAdmin) {
        db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(
          email,
          "admin123",
          "admin",
          "Akshat"
        );
      } else {
        db.prepare("UPDATE users SET role = 'admin', name = 'Akshat' WHERE email = ?").run(email);
      }
    });
  } catch (err) {
    console.error("[Database Error] Failed to initialize better-sqlite3:", err);
    // Fallback already set to mock
  }
}

// Call initDb immediately
const initPromise = initDb();

console.log(`[Server] Starting with OWNER_EMAIL: ${process.env.OWNER_EMAIL || "shachiveera@gmail.com"}`);

// Lazy Resend initialization
let resendClient: Resend | null = null;
const getResend = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log("[Resend] Client initialized successfully.");
  } else if (!resendClient && !process.env.RESEND_API_KEY) {
    console.warn("[Resend] RESEND_API_KEY is missing from environment variables.");
  }
  return resendClient;
};

async function createServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  
  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  
  if (!process.env.RESEND_API_KEY) {
    console.warn("WARNING: RESEND_API_KEY is not set. Email notifications will be disabled.");
  }

  // Health check
  app.get("/api/health", (req, res) => {
    console.log("Health check hit");
    res.json({ 
      status: "ok", 
      message: "EVERGREENS API is running!",
      db_status: db ? "initialized" : "missing",
      timestamp: new Date().toISOString() 
    });
  });

  // Auth Routes (Simplified for demo)
  app.post("/api/auth/login", (req, res) => {
    console.log("[Auth] Login request received:", req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
      let user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
      
      // Auto-register if not found (influencer side open login)
      // Also allow connect.evergreen@gmail.com (singular) as admin/auto-register
      const isAdminEmail = email === "connect.evergreens@gmail.com" || email === "connect.evergreen@gmail.com";
      
      if (!user && !isAdminEmail) {
        try {
          db.prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)").run(
            email,
            password,
            'influencer',
            email.split('@')[0] // Use email prefix as name
          );
          user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
          console.log("[Auth] Auto-registered influencer:", email);
        } catch (err) {
          console.error("[Auth] Auto-registration failed:", err);
          return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
      }

      if (user) {
        console.log("[Auth] Login successful:", email, "Role:", user.role);
        res.json({ success: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
      } else {
        console.log("[Auth] Login failed (user not found or wrong password):", email);
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("[Auth] Login error:", error);
      res.status(500).json({ success: false, message: "Internal server error during login" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    console.log("[Auth] Register request received:", req.body.email);
    const { email, password, name, role } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Email, password, and name are required" });
    }

    try {
      const result = db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(
        email, password, name, role || 'influencer'
      );
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      console.log("[Auth] Registration successful:", email, "Role:", user.role);
      res.json({ success: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } catch (e: any) {
      console.error("[Auth] Registration failed:", e.message);
      if (e.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ success: false, message: "Email already exists" });
      } else {
        res.status(500).json({ success: false, message: "Internal server error during registration" });
      }
    }
  });

  app.post("/api/proposals/:id/insights", (req, res) => {
    const { id } = req.params;
    const { reel_link, content_url, actual_reach, performance_insights } = req.body;
    try {
      db.prepare(`
        UPDATE proposals 
        SET reel_link = ?, content_url = ?, actual_reach = ?, performance_insights = ?, progress = 'completed'
        WHERE id = ?
      `).run(reel_link, content_url, actual_reach, performance_insights, id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, message: "Failed to update insights" });
    }
  });

  // Test Email Route
  app.post("/api/test-email", async (req, res) => {
    const resend = getResend();
    const ownerEmail = process.env.OWNER_EMAIL || "shachiveera@gmail.com";
    
    console.log(`[Test Email] Attempting to send to: ${ownerEmail}`);
    if (!resend) {
      return res.status(400).json({ 
        success: false, 
        message: "Resend client not initialized. Please set RESEND_API_KEY in environment variables." 
      });
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'EVERGREENS <onboarding@resend.dev>',
        to: ownerEmail,
        subject: 'Test Email – EVERGREENS Platform',
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #141414; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #1a3a32;">Test Email Successful!</h2>
            <p>This is a test email to verify your Resend configuration for the <strong>EVERGREENS Influencer Platform</strong>.</p>
            <p>If you are seeing this, it means:</p>
            <ul>
              <li>Your <code>RESEND_API_KEY</code> is valid and working.</li>
              <li>The <code>OWNER_EMAIL</code> (${ownerEmail}) is correctly configured.</li>
            </ul>
            <p>You will now receive notifications whenever a new influencer submits a collaboration proposal.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #8E9299;">
              Sent at: ${new Date().toLocaleString()} (UTC)
            </p>
          </div>
        `
      });

      if (error) {
        return res.status(500).json({ success: false, error });
      }

      res.json({ success: true, message: "Test email sent successfully!", data });
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : String(error) });
    }
  });

  // Proposal Routes
  app.post("/api/proposals", async (req, res) => {
    const { 
      influencerId, 
      influencerName, 
      influencerEmail, 
      platformHandle, 
      followersCount, 
      description, 
      reelsCount, 
      expectedReach, 
      budget 
    } = req.body;

    const result = db.prepare(`
      INSERT INTO proposals (
        influencer_id, 
        influencer_name, 
        influencer_email, 
        platform_handle, 
        followers_count, 
        description, 
        reels_count, 
        expected_reach, 
        budget
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      influencerId, 
      influencerName, 
      influencerEmail, 
      platformHandle, 
      followersCount, 
      description, 
      reelsCount, 
      expectedReach, 
      budget
    );

    // Trigger Email Notification via Resend if configured
    const resend = getResend();
    const ownerEmail = process.env.OWNER_EMAIL || "shachiveera@gmail.com";
    
    console.log("Email notification trigger check:");
    console.log("- Resend client initialized:", !!resend);
    console.log("- Owner email target:", ownerEmail);
    console.log("- RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);

    if (resend) {
      try {
        console.log("Attempting to send email via Resend...");
        const emailResponse = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: ownerEmail,
          subject: 'New Collaboration Proposal – EVERGREENS',
          html: `
            <div style="font-family: sans-serif; line-height: 1.6; color: #141414;">
              <h2 style="color: #1a3a32;">New Collaboration Proposal Received</h2>
              <p>A new collaboration proposal has been submitted on the EVERGREENS platform.</p>
              <hr style="border: 0; border-top: 1px solid #eee;" />
              <div style="background: #f9f9f7; padding: 20px; border-radius: 10px;">
                <p><strong>Name:</strong> ${influencerName}</p>
                <p><strong>Email:</strong> ${influencerEmail}</p>
                <p><strong>Platform / Handle:</strong> ${platformHandle}</p>
                <p><strong>Number of Followers:</strong> ${followersCount.toLocaleString()}</p>
                <p><strong>Collaboration Description:</strong><br/>${description}</p>
                <p><strong>Number of Reels / Posts:</strong> ${reelsCount}</p>
                <p><strong>Expected Reach:</strong> ${expectedReach.toLocaleString()}</p>
                <p><strong>Proposal Budget:</strong> ₹${budget.toLocaleString()}</p>
              </div>
              <p style="font-size: 12px; color: #8E9299; margin-top: 20px;">
                This is an automated notification from the EVERGREENS Influencer Platform.
              </p>
            </div>
          `
        });
        console.log("Resend API response:", JSON.stringify(emailResponse));
      } catch (error) {
        console.error("Failed to send email via Resend:", error);
      }
    } else {
      console.warn("Resend client not initialized. Skipping email notification.");
    }

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
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[Server Error]", err.stack);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
  });

  // Catch-all for API routes to ensure JSON response
  app.use("/api/*", (req, res) => {
    console.log(`[API 404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  return app;
}

const appPromise = createServer();

// For Vercel serverless functions
export default async (req: express.Request, res: express.Response) => {
  console.log(`[Vercel Handler] Incoming request: ${req.method} ${req.url}`);
  await initPromise;
  const app = await appPromise;
  return app(req, res);
};

// For local development
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  Promise.all([initPromise, appPromise]).then(([_, app]) => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] Admin Login: connect.evergreens@gmail.com / admin123`);
    });
  }).catch(err => {
    console.error("[Fatal Server Error]", err);
    process.exit(1);
  });
}
