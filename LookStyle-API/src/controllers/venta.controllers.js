import pool from "../config/db.js";


export const getVentas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.id_venta, v.fecha, v.total, u.nombre AS usuario
       FROM ventas v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       ORDER BY v.fecha DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const createVenta = async (req, res) => {
  const { id_usuario, total } = req.body;
  const fecha = new Date();
  try {
    const [result] = await pool.query(
      "INSERT INTO ventas (id_usuario, total , fecha) VALUES (?, ? , ?)",
      [id_usuario, total, fecha]
    );
    res.json({ id: result.insertId, id_usuario, total , fecha });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateVenta = async (req, res) => {
  const { id } = req.params;
  const { id_usuario, total, fecha } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM ventas WHERE id_venta = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    const venta = rows[0];

    const newData = {
      id_usuario: id_usuario ?? venta.id_usuario,
      total: total ?? venta.total,
      fecha: fecha ?? venta.fecha,
    };

    const [result] = await pool.query(
      `UPDATE ventas 
       SET id_usuario = ?, total = ?, fecha = ?
       WHERE id_venta = ?`,
      [newData.id_usuario, newData.total, newData.fecha, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    res.json({ mensaje: "Venta actualizada correctamente", id, ...newData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteVenta = async (req, res) => {
  const { id } = req.params;
  try {
   
    await pool.query("DELETE FROM detalle_ventas WHERE id_venta = ?", [id]);

    
    const [result] = await pool.query("DELETE FROM ventas WHERE id_venta = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    res.json({ mensaje: "Venta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
