import { Router } from "express";
import { login,
    register
 } from "../controllers/aut.controller.js";

const router = Router();

router.post("/login", login);
router.post("/token", login);
router.post("/login", login);
router.post("/register", register);

export default router;
