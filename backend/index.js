  import express from "express";
  import cors from "cors";
  import { pool } from "./db.js";

  const app = express();
  app.use(cors());
  app.use(express.json());

  /* ================================
    USER ORDERS
  ================================ */
  app.get("/orders/:address", async (req, res) => {
    const address = req.params.address.toLowerCase();

    const result = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE buyer_address = $1
      ORDER BY timestamp DESC
      `,
      [address]
    );

    res.json(result.rows);
  });

  /* ================================
    ADMIN: ALL ORDERS / FILTER
  ================================ */
  app.get("/admin/orders", async (req, res) => {
    const { buyer } = req.query;

    const query = buyer
      ? `
        SELECT *
        FROM orders
        WHERE buyer_address = $1
        ORDER BY timestamp DESC
        `
      : `
        SELECT *
        FROM orders
        ORDER BY timestamp DESC
        `;

    const params = buyer ? [buyer.toLowerCase()] : [];

    const result = await pool.query(query, params);
    res.json(result.rows);
  });

  /* ================================
    ATTACH PRODUCT NAME
  ================================ */
  app.post("/order-metadata", async (req, res) => {
    const { tx_hash, product_name } = req.body;

    await pool.query(
      `
      UPDATE orders
      SET product_name = $1
      WHERE tx_hash = $2
      `,
      [product_name, tx_hash]
    );

    res.json({ success: true });
  });

  /* ================================
    START SERVER
  ================================ */
  app.listen(4000, () => {
    console.log("🚀 Backend running on http://localhost:4000");
  });
