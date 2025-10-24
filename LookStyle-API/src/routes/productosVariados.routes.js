import { Router } from "express";
import { 
  getVariantes, 
  createVariante, 
  updateVariante, 
  deleteVariante 
} from "../controllers/productosVariantes.controllers.js";

const router = Router();

import { verificarToken } from "../middlewares/authMiddleware.js";  
import { uploadCloud } from'../middlewares/cloudinary.js'

router.get("/",getVariantes);          
router.post("/", verificarToken , uploadCloud.array("imagenes", 5),createVariante);       
router.put("/:id",verificarToken , uploadCloud.array("imagenes", 5),updateVariante);     
router.delete("/:id", verificarToken,deleteVariante);  

export default router;
