import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import categoriasRoutes from "./src/routes/categoriaProducto.routes.js";
import coloresRoutes from "./src/routes/colores.routes.js";
import tallasRoutes from "./src/routes/tallas.routes.js";
import productosRoutes from "./src/routes/productos.routes.js";
import variantesRoutes from "./src/routes/productosVariados.routes.js";
import ventaRoutes from "./src/routes/venta.routes.js";
import ventaDetalleRoutes from "./src/routes/detalleVenta.routes.js";
import loginRoutes from "./src/routes/auth.routes.js";


const app = express();

app.use(cors());
app.use(express.json());


app.get("/api", (req, res) => {
  res.json({ mensaje: "Servidor funcionando 🚀" });
});

app.use("/api/categorias", categoriasRoutes);
app.use("/api/colores", coloresRoutes);
app.use("/api/tallas", tallasRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/variantes", variantesRoutes);
app.use("/api/venta", ventaRoutes);
app.use("/api/detalle", ventaDetalleRoutes);
app.use("/api", loginRoutes);


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
