import pool from "../config/db.js";

export const getVariantes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        pv.id_variante,
        pv.id_color,
        pv.precio,
        pv.estado,
        c.nombre AS color,
        p.nombre AS producto,
        GROUP_CONCAT(DISTINCT t.nombre ORDER BY t.nombre SEPARATOR ', ') AS tallas,
        GROUP_CONCAT(DISTINCT vi.url ORDER BY vi.id_imagen SEPARATOR ', ') AS imagenes
      FROM producto_variantes pv
      LEFT JOIN colores c ON pv.id_color = c.id_color
      LEFT JOIN productos p ON pv.id_producto = p.id_producto
      LEFT JOIN variante_detalles vd ON pv.id_variante = vd.id_variante
      LEFT JOIN tallas t ON vd.id_talla = t.id_talla
      LEFT JOIN variante_imagenes vi ON pv.id_variante = vi.id_variante
      GROUP BY pv.id_variante
      ORDER BY pv.id_variante DESC;
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener variantes" });
  }
};

export const getVarianteById = async (req, res) => {
  const { id } = req.params;

  try {
    // 🔹 Obtener la información general de la variante
    const [rows] = await pool.query(
      `
      SELECT 
        pv.id_variante,
        pv.id_producto,
        pv.id_color,
        pv.precio,
        pv.estado,
        p.nombre AS producto,
        c.nombre AS color
      FROM producto_variantes pv
      LEFT JOIN productos p ON pv.id_producto = p.id_producto
      LEFT JOIN colores c ON pv.id_color = c.id_color
      WHERE pv.id_variante = ?;
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Variante no encontrada" });
    }

    const variante = rows[0];

    // 🔹 Obtener tallas y cantidades asociadas
    const [tallas] = await pool.query(
      `
      SELECT 
        t.id_talla, 
        t.nombre, 
        vd.cantidad
      FROM variante_detalles vd
      INNER JOIN tallas t ON vd.id_talla = t.id_talla
      WHERE vd.id_variante = ?;
      `,
      [id]
    );

    // 🔹 Obtener imágenes asociadas
    const [imagenes] = await pool.query(
      `
      SELECT 
        id_imagen, 
        url
      FROM variante_imagenes
      WHERE id_variante = ?;
      `,
      [id]
    );

    // 🔹 Estructurar respuesta
    const resultado = {
      ...variante,
      tallas,
      imagenes,
    };

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la variante" });
  }
};

export const getVariantesByProductoId = async (req, res) => {
  const { id } = req.params; // id_producto

  try {
    // 🔹 Obtener las variantes del producto
    const [variantes] = await pool.query(
      `
      SELECT 
        pv.id_variante,
        pv.id_producto,
        pv.id_color,
        pv.precio,
        pv.estado,
        p.nombre AS producto,
        c.nombre AS color
      FROM producto_variantes pv
      LEFT JOIN productos p ON pv.id_producto = p.id_producto
      LEFT JOIN colores c ON pv.id_color = c.id_color
      WHERE pv.id_producto = ?;
      `,
      [id]
    );

    if (variantes.length === 0) {
      return res.status(404).json({ message: "No se encontraron variantes para este producto" });
    }

    // 🔹 Para cada variante, obtener tallas e imágenes
    const resultado = await Promise.all(
      variantes.map(async (variante) => {
        const [tallas] = await pool.query(
          `
          SELECT 
            t.id_talla, 
            t.nombre, 
            vd.cantidad
          FROM variante_detalles vd
          INNER JOIN tallas t ON vd.id_talla = t.id_talla
          WHERE vd.id_variante = ?;
          `,
          [variante.id_variante]
        );

        const [imagenes] = await pool.query(
          `
          SELECT 
            id_imagen, 
            url
          FROM variante_imagenes
          WHERE id_variante = ?;
          `,
          [variante.id_variante]
        );

        return {
          ...variante,
          tallas,
          imagenes,
        };
      })
    );

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las variantes del producto" });
  }
};


export const createVariante = async (req, res) => {
  const { id_producto, id_color, precio, tallas, estado } = req.body;

  // 🧩 Parsear tallas
  let parsedTallas = [];
  try {
    if (typeof tallas === "string") {
      parsedTallas = JSON.parse(tallas);
    } else if (Array.isArray(tallas)) {
      parsedTallas = tallas;
    }
  } catch (err) {
    console.error("❌ Error al parsear tallas:", err);
    return res.status(400).json({ message: "Formato inválido de tallas" });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1️⃣ Crear la variante
    const [resultVariante] = await connection.query(
      "INSERT INTO producto_variantes (id_producto, id_color, precio, estado) VALUES (?, ?, ?, ?)",
      [id_producto, id_color, precio, estado || "Activo"]
    );

    const id_variante = resultVariante.insertId;

    // 2️⃣ Insertar tallas
    for (const talla of parsedTallas) {
      if (!talla.id_talla || talla.cantidad == null) continue;
      await connection.query(
        "INSERT INTO variante_detalles (id_variante, id_talla, cantidad) VALUES (?, ?, ?)",
        [id_variante, talla.id_talla, talla.cantidad]
      );
    }

    // 3️⃣ Insertar imágenes (si existen)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imagenUrl = file.path; // ✅ usar file.path
        await connection.query(
          "INSERT INTO variante_imagenes (id_variante, url) VALUES (?, ?)",
          [id_variante, imagenUrl]
        );
      }
    }

    await connection.commit();
    return res.status(201).json({ message: "Variante creada correctamente ✅" });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error en createVariante:", error);
    return res
      .status(500)
      .json({ message: "Error al crear variante", error: error.message });
  } finally {
    connection.release();
  }
};

// 🔹 Actualizar una variante con nuevas imágenes (opcional)
export const updateVariante = async (req, res) => {
  const { id } = req.params;
  const { id_color, precio, estado } = req.body;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1️⃣ Actualizar datos básicos
    await connection.query(
      "UPDATE producto_variantes SET id_color=?, precio=?, estado=? WHERE id_variante=?",
      [id_color, precio, estado, id]
    );

    // 2️⃣ Obtener imágenes actuales
    const [imagenesActuales] = await connection.query(
      "SELECT url FROM variante_imagenes WHERE id_variante=?",
      [id]
    );

    // 3️⃣ Eliminar imágenes de Cloudinary y base de datos si hay nuevas
    if (req.files && req.files.length > 0 && imagenesActuales.length > 0) {
      for (const img of imagenesActuales) {
        // Extraer el public_id desde la URL
        const parts = img.url.split("/");
        const filename = parts[parts.length - 1].split(".")[0];
        const publicId = `LookStyle/${filename}`;

        // Intentar eliminar en Cloudinary
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("No se pudo eliminar imagen:", img.url);
        }
      }

      // Borrar las antiguas de la BD
      await connection.query(
        "DELETE FROM variante_imagenes WHERE id_variante=?",
        [id]
      );
    }

    // 4️⃣ Insertar nuevas imágenes si se enviaron
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await connection.query(
          "INSERT INTO variante_imagenes (id_variante, url) VALUES (?, ?)",
          [id, file.path]
        );
      }
    }

    await connection.commit();
    res.json({ message: "Variante actualizada correctamente" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la variante" });
  } finally {
    connection.release();
  }
};

// 🔹 Eliminar variante (cascada elimina detalles e imágenes)
export const deleteVariante = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM producto_variantes WHERE id_variante=?", [id]);
    res.json({ message: "Variante eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar variante" });
  }
};
