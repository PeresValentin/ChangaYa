// routes/utilsRoutes.js
import express from "express";
import { geocodeAddress } from "../controllers/utilsController.js";
import { verificarToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// protegido con JWT para evitar abuso
router.get("/geocode", verificarToken, geocodeAddress);

export default router;