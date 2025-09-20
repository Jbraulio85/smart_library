import { Router } from "express";
import { listDegrees } from "./degree.controller.js";

/**
 * @swagger
 * tags:
 *   name: Degree
 *   description: Endpoints para la gestión de grados escolares
 */

/**
 * @swagger
 * /degree/:
 *   get:
 *     summary: Obtiene la lista de grados activos
 *     tags: [Degree]
 *     responses:
 *       200:
 *         description: Lista de grados obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 degrees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       500:
 *         description: Error listando grados
 */

const router = Router();

router.get("/", listDegrees);

export default router;