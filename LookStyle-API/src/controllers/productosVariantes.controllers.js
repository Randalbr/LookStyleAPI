import pool from "../config/db.js";
import { v2 as cloudinary } from "cloudinary";

// 🔹 Configuración de Cloudinary (asegúrate de tener las variables en tu .env)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// =====================================================
// 🔹 OBTENER TODAS LAS VARIANTES (con color, tallas e imágenes)
// =====================================================
export const getVariantes = async (req, res) => {
  try {
    const [variantes] = await pool.query(`
      SELECT 
        v.id_variante,
        p.nombre AS producto,
        c.nombre AS color,
        v.precio,
        v.estado
      FROM producto_variantes v
      JOIN productos p ON v.id_producto = p.id_producto
      JOIN colores c ON v.id_color = c.id_color
    `);

    // Obtener tallas e imágenes de cada variante
    for (const variante of variantes) {
      const [tallas] = await pool.query(
        `SELECT t.nombre AS talla, d.cantidad 
         FROM variante_detalles d 
         JOIN tallas t ON d.id_talla = t.id_talla
         WHERE d.id_variante = ?`,
        [variante.id_variante]
      );

      const [imagenes] = await pool.query(
        `SELECT url FROM variante_imagenes WHERE id_variante = ?`,
        [variante.id_variante]
      );

      variante.tallas = tallas;
      variante.imagenes = imagenes.map((img) => img.url);
    }

    res.json(variantes);
  } catch (error) {
    console.error("Error al obtener variantes:", error);
    res.status(500).json({ error: error.message });
  }
};

// =====================================================
// 🔹 CREAR VARIANTES (con tallas y múltiples imágenes)
// =====================================================
export const createVariante = async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const { id_producto, colores, tallas, precio } = req.body;
    const files = req.files || [];

    if (!id_producto || !colores || !tallas || !files.length) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const coloresArray = Array.isArray(colores) ? colores : [colores];
    const tallasArray = Array.isArray(tallas) ? tallas : [tallas];

    const variantesCreadas = [];

    for (const id_color of coloresArray) {
      // 1️⃣ Crear la variante principal
      const [varianteResult] = await connection.query(
        "INSERT INTO producto_variantes (id_producto, id_color, precio) VALUES (?, ?, ?)",
        [id_producto, id_color, precio]
      );

      const id_variante = varianteResult.insertId;

      // 2️⃣ Insertar tallas y cantidades
      for (const talla of tallasArray) {
        const { id_talla, cantidad } = JSON.parse(talla);
        await connection.query(
          "INSERT INTO variante_detalles (id_variante, id_talla, cantidad) VALUES (?, ?, ?)",
          [id_variante, id_talla, cantidad || 0]
        );
      }

      // 3️⃣ Subir imágenes a Cloudinary
      const urls = [];
      for (const file of files) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "productos/variantes",
        });
        urls.push(upload.secure_url);

        await connection.query(
          "INSERT INTO variante_imagenes (id_variante, url) VALUES (?, ?)",
          [id_variante, upload.secure_url]
        );
      }

      variantesCreadas.push({
        id_variante,
        id_producto,
        id_color,
        precio,
        tallas: tallasArray,
        imagenes: urls,
      });
    }

    await connection.commit();
    res.json({
      mensaje: "Variantes creadas correctamente",
      variantes: variantesCreadas,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al crear variante:", error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

// =====================================================
// 🔹 ACTUALIZAR VARIANTE (precio, estado o nuevas imágenes)
// =====================================================
export const updateVariante = async (req, res) => {
  const { id } = req.params;
  const { precio, estado } = req.body;
  const files = req.files || [];

  try {
    const [rows] = await pool.query(
      "SELECT * FROM producto_variantes WHERE id_variante = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Variante no encontrada" });
    }

    const variante = rows[0];
    const newPrecio = precio ?? variante.precio;
    const newEstado = estado ?? variante.estado;

    await pool.query(
      "UPDATE producto_variantes SET precio = ?, estado = ? WHERE id_variante = ?",
      [newPrecio, newEstado, id]
    );

    // Si se envían nuevas imágenes, se suben y reemplazan
    if (files.length > 0) {
      await pool.query("DELETE FROM variante_imagenes WHERE id_variante = ?", [id]);

      for (const file of files) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "productos/variantes",
        });

        await pool.query(
          "INSERT INTO variante_imagenes (id_variante, url) VALUES (?, ?)",
          [id, upload.secure_url]
        );
      }
    }

    res.json({ mensaje: "Variante actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar variante:", error);
    res.status(500).json({ error: error.message });
  }
};

// =====================================================
// 🔹 ELIMINAR VARIANTE (se elimina en cascada)
// =====================================================
export const deleteVariante = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM producto_variantes WHERE id_variante = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Variante no encontrada" });
    }

    res.json({ mensaje: "Variante eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar variante:", error);
    res.status(500).json({ error: error.message });
  }
};
