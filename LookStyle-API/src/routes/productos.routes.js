import { Router } from "express";
import { 
  getProductos, 
  getProductoById, 
  createProducto, 
  updateProducto, 
  deleteProducto 
} from "../controllers/productos.controllers.js";

const router = Router();

import { verificarToken } from "../middlewares/authMiddleware.js";  
import { uploadCloud } from'../middlewares/cloudinary.js'

router.get("/", getProductos);         
router.get("/:id",getProductoById); 
router.post("/", verificarToken, uploadCloud.single("imagen"),createProducto);     
router.put("/:id", verificarToken, uploadCloud.single("imagen"),updateProducto);   
router.delete("/:id", verificarToken,deleteProducto);

export default router;
