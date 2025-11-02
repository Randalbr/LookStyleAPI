import pool from "../config/db.js";

export const getColores = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM `colores`");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getColorById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM colores WHERE id_color = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Color no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createColores = async (req, res) => {
  const { nombre, codigo } = req.body;

  if (!nombre || !codigo) {
    return res.status(400).json({ error: "Nombre y código son requeridos" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO colores (nombre, codigo) VALUES (?, ?)",
      [nombre, codigo]
    );
    res.json({ id: result.insertId, nombre, codigo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateColores = async (req, res) => {
  const { id } = req.params;
  const { nombre, codigo } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE colores SET nombre = ?, codigo = ? WHERE id_color = ?",
      [nombre, codigo, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Color no encontrado" });
    }

    res.json({ id, nombre, codigo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteColores = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM colores WHERE id_color = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Color no encontrado" });
    }

    res.json({ mensaje: "Color eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};