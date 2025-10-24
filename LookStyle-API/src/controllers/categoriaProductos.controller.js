import pool from "../config/db.js";

export const getCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categoria_productos");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getCategoriaById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM categoria_productos WHERE id_categoria = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre?.trim() || !descripcion?.trim()) {
      return res
        .status(400)
        .json({ error: "Nombre y descripción son obligatorios" });
    }

    const imagenUrl = req.file ? req.file.path : null;

    const [result] = await pool.query(
      "INSERT INTO categoria_productos (nombre, descripcion, imagen) VALUES (?, ?, ?)",
      [nombre.trim(), descripcion.trim(), imagenUrl]
    );

    res.status(201).json({
      mensaje: "Categoría creada correctamente ✅",
      data: {
        id_categoria: result.insertId,
        nombre,
        descripcion,
        imagen: imagenUrl,
      },
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM categoria_productos WHERE id_categoria = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const categoriaActual = rows[0];

    const nuevaImagen = req.file ? req.file.path : categoriaActual.imagen;

    await pool.query(
      "UPDATE categoria_productos SET nombre = ?, descripcion = ?, imagen = ? WHERE id_categoria = ?",
      [
        nombre?.trim() || categoriaActual.nombre,
        descripcion?.trim() || categoriaActual.descripcion,
        nuevaImagen,
        id,
      ]
    );

    res.json({
      mensaje: "Categoría actualizada correctamente ✅",
      data: {
        id_categoria: id,
        nombre: nombre || categoriaActual.nombre,
        descripcion: descripcion || categoriaActual.descripcion,
        imagen: nuevaImagen,
      },
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ error: error.message });
  }
};


export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM categoria_productos WHERE id_categoria = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json({ mensaje: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la categoría:", error);
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
};
