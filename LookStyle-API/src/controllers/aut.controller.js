import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// 🔹 LOGIN
export const login = async (req, res) => {
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: "Nombre y contraseña son obligatorios" });
  }

  try {
    // 🔍 Buscar usuario activo por nombre
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE nombre = ?",
      [nombre]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado o inactivo" });
    }

    const usuario = rows[0];

    // 🔐 Verificar contraseña
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 🔑 Generar token JWT
    const token = jwt.sign(
      { id: usuario.id_usuario, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
      },
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// 🔹 REGISTRO
export const register = async (req, res) => {
  const { nombre, password } = req.body;

  if (!nombre || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el nombre ya existe
    const [existente] = await pool.query(
      "SELECT * FROM usuarios WHERE nombre = ?",
      [nombre]
    );

    if (existente.length > 0) {
      return res.status(400).json({ error: "El nombre de usuario ya existe" });
    }

    // 🔐 Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // 🔹 Insertar usuario con estado activo por defecto
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, password) VALUES (?, ?)",
      [nombre, hash]
    );

    res.json({
      mensaje: "Usuario registrado correctamente",
      id: result.insertId,
      nombre,
      estado: "activo",
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};
