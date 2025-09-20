import { Router } from "express";
import { register, verifyEmail,login } from "./auth.controller.js"
import { registerValidator, loginValidator } from "../middlewares/user-validators.js";
import { uploadProfileImage } from "../middlewares/multer-upload.js";

const router = Router()

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post(
    "/register",
    uploadProfileImage.single("profilePicture"),  
    registerValidator,
    
    register
)

router.get("/verify/:code", verifyEmail)

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Inicia sesión con email o username y contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@correo.com
 *               username:
 *                 type: string
 *                 example: usuario123
 *               password:
 *                 type: string
 *                 example: 12345678
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
router.post("/login",loginValidator,login )

export default router