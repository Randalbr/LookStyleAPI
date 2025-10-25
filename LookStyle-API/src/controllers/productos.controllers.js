import pool from "../config/db.js";
import cloudinary from "../config/cloudinary.js";

export const getProductos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id_producto, p.nombre, p.descripcion, p.precio_base,  p.imagen,
              c.nombre AS categoria
       FROM productos p
       LEFT JOIN categoria_productos c ON p.id_categoria = c.id_categoria`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT p.id_producto, p.nombre, p.descripcion, p.precio_base, p.imagen, 
              c.nombre AS categoria
       FROM productos p
       LEFT JOIN categoria_productos c ON p.id_categoria = c.id_categoria
       WHERE p.id_producto = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo producto
export const createProducto = async (req, res) => {
    const { nombre, descripcion, precio_base, id_categoria } = req.body;

  try {
    // ✅ Validaciones
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ error: "El nombre no puede estar vacío" });
    }

    if (!descripcion || descripcion.trim() === "") {
      return res.status(400).json({ error: "La descripción no puede estar vacía" });
    }

    if (!precio_base || isNaN(precio_base)) {
      return res.status(400).json({ error: "El precio base debe ser un número válido" });
    }

    if (!id_categoria) {
      return res.status(400).json({ error: "Debes seleccionar una categoría" });
    }

    
    const imagenUrl = req.file ? req.file.path : null;

    // ✅ Guardar en MySQL
    const [insert] = await pool.query(
      "INSERT INTO productos (nombre, descripcion, precio_base, id_categoria, imagen) VALUES (?, ?, ?, ?, ?)",
      [nombre, descripcion, precio_base, id_categoria, imagenUrl]
    );

    // ✅ Respuesta
    res.json({
      mensaje: "Producto creado correctamente 🚀",
      id: insert.insertId,
      nombre,
      descripcion,
      precio_base,
      id_categoria,
      imagen: imagenUrl,
    });
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio_base, id_categoria } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = rows[0];
    const newData = {
      nombre: nombre ?? producto.nombre,
      descripcion: descripcion ?? producto.descripcion,
      precio_base: precio_base ?? producto.precio_base,
      id_categoria: id_categoria ?? producto.id_categoria,
      imagen : req.file ? req.file.path : producto.imagen,
    };

    await pool.query(
      "UPDATE productos SET nombre=?, descripcion=?, precio_base=?, id_categoria=?, imagen= ? WHERE id_producto=?",
      [newData.nombre, newData.descripcion, newData.precio_base, newData.id_categoria, newData.imagen,id]
    );

    res.json({ mensaje: "Producto actualizado", data: newData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM productos WHERE id_producto = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
