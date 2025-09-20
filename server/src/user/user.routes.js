import { Router } from "express";
import { updateProfile, deleteProfilePicture,  updatePassword, getUsers, deleteUser, updateProfilePicture, getProfileInfo } from "./user.controller.js";
import { updateUserValidator, deleteProfilePictureValidator, updatePasswordValidator, getUsersValidator, deleteUserValidator, updateProfilePictureValidator, getProfileInfoValidator } from "../middlewares/user-validators.js";
import { uploadProfileImage } from "../middlewares/multer-upload.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Endpoints para la gestión de usuarios y su perfil
 */

/**
 * @swagger
 * /user/updateProfile:
 *   put:
 *     summary: Actualiza los datos del perfil del usuario autenticado
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       500:
 *         description: Error al actualizar el perfil
 */
router.put("/updateProfile", updateUserValidator, updateProfile)

/**
 * @swagger
 * /user/updatePassword:
 *   patch:
 *     summary: Actualiza la contraseña del usuario autenticado
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: La nueva contraseña no puede ser igual a la anterior
 *       500:
 *         description: Error al actualizar contraseña
 */
router.patch("/updatePassword", updatePasswordValidator, updatePassword)

/**
 * @swagger
 * /user/getUsers:
 *   get:
 *     summary: Obtiene la lista de usuarios activos
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Límite de resultados
 *       - in: query
 *         name: desde
 *         schema:
 *           type: integer
 *         description: Offset de resultados
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente
 *       500:
 *         description: Error al obtener los usuarios
 */
router.get("/getUsers", getUsersValidator, getUsers)

/**
 * @swagger
 * /user/deleteUser/{uid}:
 *   delete:
 *     summary: Elimina (desactiva) un usuario por su ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       500:
 *         description: Error al eliminar el usuario
 */
router.delete("/deleteUser/:uid", deleteUserValidator, deleteUser)

/**
 * @swagger
 * /user/updateProfilePicture:
 *   patch:
 *     summary: Actualiza la foto de perfil del usuario autenticado
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto actualizada
 *       400:
 *         description: No hay archivo en la petición
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar la foto
 */
router.patch("/updateProfilePicture", uploadProfileImage.single("profilePicture"), updateProfilePictureValidator, updateProfilePicture)

/**
 * @swagger
 * /user/getProfileInfo:
 *   get:
 *     summary: Obtiene la información del perfil del usuario autenticado
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener el perfil
 */
router.get("/getProfileInfo", getProfileInfoValidator, getProfileInfo)

/**
 * @swagger
 * /user/deleteProfilePicture:
 *   delete:
 *     summary: Restablece la foto de perfil del usuario a la imagen por defecto
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Foto de perfil restablecida a la imagen por defecto
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al eliminar la foto
 */
router.delete("/deleteProfilePicture", deleteProfilePictureValidator, deleteProfilePicture);

export default router;