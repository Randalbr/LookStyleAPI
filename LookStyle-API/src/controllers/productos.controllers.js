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
    if (rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    const producto = rows[0];
    let imagenFinal = producto.imagen;

    // Si hay una nueva imagen, eliminar la anterior de Cloudinary
    if (req.file) {
      if (producto.imagen) {
        const publicId = producto.imagen.split("/").pop().split(".")[0]; // extrae el ID del archivo
        try {
          await cloudinary.uploader.destroy(`LookStyle/${publicId}`);
        } catch (err) {
          console.warn("⚠️ No se pudo eliminar la imagen anterior:", err.message);
        }
      }
      imagenFinal = req.file.path;
    }

    await pool.query(
      "UPDATE productos SET nombre=?, descripcion=?, precio_base=?, id_categoria=?, imagen=? WHERE id_producto=?",
      [nombre ?? producto.nombre, descripcion ?? producto.descripcion, precio_base ?? producto.precio_base, id_categoria ?? producto.id_categoria, imagenFinal, id]
    );

    res.json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT imagen FROM productos WHERE id_producto = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Producto no encontrado" });

    const imagen = rows[0].imagen;

    // ✅ Eliminar imagen de Cloudinary si existe
    if (imagen) {
      const publicId = imagen.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`LookStyle/${publicId}`);
      } catch (err) {
        console.warn("⚠️ No se pudo eliminar la imagen en Cloudinary:", err.message);
      }
    }

    // ✅ Eliminar producto de la base de datos
    const [result] = await pool.query("DELETE FROM productos WHERE id_producto = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "No se pudo eliminar el producto" });

    res.json({ mensaje: "Producto e imagen eliminados correctamente 🗑️" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ error: error.message });
  }
};
