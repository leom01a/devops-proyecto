import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

/* =========================
   HEALTH CHECK (AWS ALB)
========================= */
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

/* =========================
   DASHBOARD
========================= */
app.get("/api/dashboard", async (_req, res, next) => {
  try {
    const [[itemTotals]] = await pool.query(`
      SELECT
        COUNT(*) AS totalItems,
        SUM(CASE WHEN stock <= minimum_stock THEN 1 ELSE 0 END) AS lowStockItems
      FROM inventory_items
    `);

    const [[ticketTotals]] = await pool.query(`
      SELECT
        COUNT(*) AS totalTickets,
        SUM(CASE WHEN status <> 'cerrado' THEN 1 ELSE 0 END) AS openTickets
      FROM support_tickets
    `);

    res.json({
      totalItems: Number(itemTotals.totalItems || 0),
      lowStockItems: Number(itemTotals.lowStockItems || 0),
      totalTickets: Number(ticketTotals.totalTickets || 0),
      openTickets: Number(ticketTotals.openTickets || 0)
    });

  } catch (error) {
    next(error);
  }
});

/* =========================
   ITEMS
========================= */
app.get("/api/items", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, category, stock, location, minimum_stock, created_at, updated_at
      FROM inventory_items
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/items", async (req, res, next) => {
  try {
    const { name, category, stock, location, minimum_stock } = req.body;

    const [result] = await pool.query(`
      INSERT INTO inventory_items (name, category, stock, location, minimum_stock)
      VALUES (?, ?, ?, ?, ?)
    `, [name, category, stock, location, minimum_stock]);

    const [[createdItem]] = await pool.query(
      "SELECT * FROM inventory_items WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(createdItem);

  } catch (error) {
    next(error);
  }
});

/* =========================
   TICKETS
========================= */
app.get("/api/tickets", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT st.*, ii.name AS related_item_name
      FROM support_tickets st
      LEFT JOIN inventory_items ii ON ii.id = st.related_item_id
      ORDER BY st.id DESC
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

/* =========================
   ERROR HANDLER
========================= */
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: "Error interno en la API"
  });
});

export default app;