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
    res.status(200).json({ status: "okk", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "errror", database: "disconnected" });
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

app.post("/api/tickets", async (req, res, next) => {
  try {
    const { title, description, priority, status, related_item_id } = req.body;

    const [result] = await pool.query(`
      INSERT INTO support_tickets (title, description, priority, status, related_item_id)
      VALUES (?, ?, ?, ?, ?)
    `, [title, description, priority || "media", status || "Abierto", related_item_id || null]);

   
    const [[createdTicket]] = await pool.query(`
      SELECT st.*, ii.name AS related_item_name
      FROM support_tickets st
      LEFT JOIN inventory_items ii ON ii.id = st.related_item_id
      WHERE st.id = ?
    `, [result.insertId]);

    res.status(201).json(createdTicket);

  } catch (error) {
    next(error);
  }
});

/* =========================
   ELIMINAR ITEMS Y TICKETS
========================= */

// Eliminar un producto del inventario
app.delete("/api/items/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM inventory_items WHERE id = ?", 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado con éxito" });
  } catch (error) {
    next(error);
  }
});

// Eliminar un ticket de soporte
app.delete("/api/tickets/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM support_tickets WHERE id = ?", 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json({ message: "Ticket eliminado con éxito" });
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