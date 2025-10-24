import { Router } from "express";
import { getVentas, createVenta, updateVenta, deleteVenta } from "../controllers/venta.controllers.js";

const router = Router();

router.get("/", getVentas);
router.post("/", createVenta);
router.put("/:id", updateVenta);
router.delete("/:id", deleteVenta);

export default router;
