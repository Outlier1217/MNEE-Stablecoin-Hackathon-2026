import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET orders by wallet
router.get("/:address", async (req, res) => {
  const { address } = req.params;

  const { rows } = await pool.query(
    `SELECT * FROM orders 
     WHERE buyer_address = $1 
     ORDER BY timestamp DESC`,
    [address]
  );

  res.json(rows);
});

export default router;
