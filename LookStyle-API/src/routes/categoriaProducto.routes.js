import { Router } from "express";
import {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../controllers/categoriaProductos.controller.js";

import { verificarToken } from "../middlewares/authMiddleware.js";
import { uploadCloud } from "../middlewares/cloudinary.js";

const router = Router();

router.get("/", getCategorias);
router.get("/:id", getCategoriaById);
router.post("/", verificarToken, uploadCloud.single("imagen"), createCategoria);
router.put("/:id", verificarToken, uploadCloud.single("imagen"), updateCategoria);
router.delete("/:id", verificarToken, deleteCategoria);

export default router;
