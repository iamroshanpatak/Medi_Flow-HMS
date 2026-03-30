// ============================================================
// HOW TO CONNECT AI ROUTES TO YOUR EXISTING server.js
// ============================================================
// Open your existing backend/server.js and add these 2 lines:
//
//   const aiRoutes = require("./routes/aiRoutes");     // line 1 — add near other requires
//   app.use("/api/ai", aiRoutes);                      // line 2 — add near other app.use() calls
//
// That's it. Your 3 AI endpoints will then be available at:
//   POST http://localhost:5000/api/ai/triage
//   POST http://localhost:5000/api/ai/waittime
//   POST http://localhost:5000/api/ai/faq
// ============================================================

// EXAMPLE of what your server.js should look like after the change:

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Your existing routes (do NOT remove these) ---
// const authRoutes = require("./routes/authRoutes");
// const appointmentRoutes = require("./routes/appointmentRoutes");
// app.use("/api/auth", authRoutes);
// app.use("/api/appointments", appointmentRoutes);

// --- ADD THIS: AI Routes ---
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);
// --------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
