import pool from "../config/db.js";

export const getTalla = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM `tallas`");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SELECT nombre FROM `tallas` WHERE id_talla=1

export const getTallaById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT nombre FROM tallas WHERE id_talla = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Talla no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTalla = async (req, res) => {
  const { nombre } = req.body;

   if (!nombre || nombre.trim() === "") {
    return res.status(400).json({ error: "El nombre no puede estar vacío" });
  }
  
  try {
    const [result] = await pool.query(
      "INSERT INTO tallas (nombre) VALUES (?)",
      [nombre]
    );
    res.json({ id: result.insertId, nombre });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTalla = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM tallas WHERE id_talla = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Talla no encontrada" });
    }

    const talla = rows[0];
    const newData = { nombre: nombre ?? talla.nombre };

    await pool.query("UPDATE tallas SET nombre=? WHERE id_talla=?", [newData.nombre, id]);

    res.json({ mensaje: "Talla actualizada", data: newData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteTalla = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM tallas WHERE id_talla = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Talla no encontrado" });
    }

    res.json({ mensaje: "Talla eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};