import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Acceso denegado. Token requerido." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Formato de token inválido." });
    }

    const secret = process.env.JWT_SECRET;

    console.log(secret)
    const decoded = jwt.verify(token, secret);

    req.usuario = decoded;

    next();
  } catch (error) {
    console.error("❌ Error de verificación JWT:", error.message);
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
};
