import pool from "../config/db.js";

export const getDetalleVenta = async (req, res) => {
  const { id_venta } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT d.id_detalle, d.cantidad, 
              p.nombre AS producto, c.nombre AS color, t.nombre AS talla
       FROM detalle_venta d
       JOIN producto_variantes v ON d.id_variante = v.id_variante
       JOIN productos p ON v.id_producto = p.id_producto
       JOIN colores c ON v.id_color = c.id_color
       JOIN tallas t ON v.id_talla = t.id_talla
       WHERE d.id_venta = ?`,
      [id_venta]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDetalleVenta = async (req, res) => {
  const { id_venta, id_variante, cantidad } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO detalle_venta (id_venta, id_variante, cantidad) VALUES (?, ?, ?)",
      [id_venta, id_variante, cantidad]
    );

    await pool.query(
      "UPDATE producto_variantes SET cantidad = cantidad - ? WHERE id_variante = ?",
      [cantidad, id_variante]
    );

    res.json({
      mensaje: "Detalle creado correctamente",
      id: result.insertId,
      id_venta,
      id_variante,
      cantidad,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateDetalleVenta = async (req, res) => {
  const { id } = req.params;
  const { id_venta, id_variante, cantidad } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM detalle_venta WHERE id_detalle = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }

    const detalle = rows[0];

    const newData = {
      id_venta: id_venta ?? detalle.id_venta,
      id_variante: id_variante ?? detalle.id_variante,
      cantidad: cantidad ?? detalle.cantidad,
    };

    const diferencia = newData.cantidad - detalle.cantidad;

    if (diferencia !== 0) {
      await pool.query(
        "UPDATE producto_variantes SET cantidad = cantidad - ? WHERE id_variante = ?",
        [diferencia, newData.id_variante]
      );
    }

    const [result] = await pool.query(
      `UPDATE detalle_venta 
       SET id_venta = ?, id_variante = ?, cantidad = ?
       WHERE id_detalle = ?`,
      [newData.id_venta, newData.id_variante, newData.cantidad, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }

    res.json({
      mensaje: "Detalle actualizado correctamente",
      id,
      ...newData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDetalleVenta = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM detalle_venta WHERE id_detalle = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }

    const detalle = rows[0];

    await pool.query(
      "UPDATE producto_variantes SET cantidad = cantidad + ? WHERE id_variante = ?",
      [detalle.cantidad, detalle.id_variante]
    );

    const [result] = await pool.query(
      "DELETE FROM detalle_venta WHERE id_detalle = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Detalle no encontrado" });
    }

    res.json({
      mensaje: "Detalle eliminado y stock devuelto correctamente",
      id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
