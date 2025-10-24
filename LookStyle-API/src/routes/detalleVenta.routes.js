import { Router } from "express";
import { 
  getDetalleVenta, 
  createDetalleVenta, 
  updateDetalleVenta, 
  deleteDetalleVenta 
} from "../controllers/detalleVente.controllers.js";

import { verificarToken } from "../middlewares/authMiddleware.js";   
const router = Router();

router.get("/:id_venta", verificarToken,getDetalleVenta);
router.post("/",verificarToken, createDetalleVenta);
router.put("/:id",verificarToken, updateDetalleVenta);
router.delete("/:id",verificarToken, deleteDetalleVenta);

export default router;
