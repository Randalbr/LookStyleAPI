import { Router } from "express";
import {  getTalla, 
  getTallaById,
  createTalla, 
  updateTalla, 
  deleteTalla 
 } from "../controllers/tallas.controllers.js";
import { verificarToken } from "../middlewares/authMiddleware.js";   
const router = Router();


router.get("/", getTalla);      
router.get("/:id", getTallaById);      
router.post("/",verificarToken , createTalla);     
router.put("/:id", verificarToken, updateTalla);   
router.delete("/:id", verificarToken, deleteTalla);

export default router;
