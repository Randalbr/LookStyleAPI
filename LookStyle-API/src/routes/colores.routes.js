import { Router } from "express";
import {  getColores, 
  getColorById,
  createColores, 
  updateColores, 
  deleteColores 
 } from "../controllers/colores.controllers.js";

import { verificarToken } from "../middlewares/authMiddleware.js";   
const router = Router();


router.get("/", getColores);      
router.get("/:id", getColorById);      
router.post("/",verificarToken, createColores);     
router.put("/:id",verificarToken, updateColores);   
router.delete("/:id",verificarToken, deleteColores);

export default router;
