import { Router } from 'express';
import { getDocuments, getDocumentById, editCourseDocument, deleteCourseDocument, getRecentDocuments, getDocumentProxy } from './document.controller.js';

import { getDocumentsValidator, getDocumentByIdValidator, editCourseDocumentValidator, deleteCourseDocumentValidator, getRecentDocumentsValidator } from '../middlewares/document-validator.js';

import { validateJWT } from '../middlewares/validate-jwt.js';
import { hasRoles } from '../middlewares/role-validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Document
 *   description: Endpoints para la gestión de documentos de cursos
 */

/**
 * @swagger
 * /document/getDocuments:
 *   get:
 *     summary: Obtiene todos los documentos de todos los cursos
 *     tags: [Document]
 *     responses:
 *       200:
 *         description: Lista de documentos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   courseId:
 *                     type: string
 *                   courseName:
 *                     type: string
 *                   fileName:
 *                     type: string
 *                   filePath:
 *                     type: string
 *                   bimester:
 *                     type: integer
 *                   uploadedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error al obtener los documentos
 */
router.get('/getDocuments', getDocumentsValidator, getDocuments);

/**
 * @swagger
 * /document/getDocumentById/{cid}/{docId}:
 *   get:
 *     summary: Obtiene un documento específico de un curso por su ID
 *     tags: [Document]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del documento
 *     responses:
 *       200:
 *         description: Documento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courseId:
 *                   type: string
 *                 courseName:
 *                   type: string
 *                 fileName:
 *                   type: string
 *                 filePath:
 *                   type: string
 *                 bimester:
 *                   type: integer
 *                 uploadedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Curso o documento no encontrado
 *       500:
 *         description: Error al obtener el documento
 */
router.get('/getDocumentById/:cid/:docId', getDocumentByIdValidator, getDocumentById);

/**
 * @swagger
 * /document/editCourseDocument/{cid}/{docId}:
 *   patch:
 *     summary: Edita los datos de un documento de un curso (solo profesores)
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del documento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileName:
 *                 type: string
 *               filePath:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documento actualizado correctamente
 *       404:
 *         description: Curso o documento no encontrado
 *       500:
 *         description: Error al actualizar el documento
 */
router.patch('/editCourseDocument/:cid/:docId', [validateJWT, hasRoles('TEACHER_ROLE'), editCourseDocumentValidator], editCourseDocument);

/**
 * @swagger
 * /document/deleteCourseDocument/{cid}/{docId}:
 *   delete:
 *     summary: Elimina un documento de un curso (solo profesores)
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del documento
 *     responses:
 *       200:
 *         description: Documento eliminado correctamente
 *       404:
 *         description: Curso o documento no encontrado
 *       500:
 *         description: Error al eliminar el documento
 */
router.delete('/deleteCourseDocument/:cid/:docId', [validateJWT, hasRoles('TEACHER_ROLE'), deleteCourseDocumentValidator], deleteCourseDocument);

/**
 * @swagger
 * /document/getRecentDocuments/{cid}:
 *   get:
 *     summary: Obtiene los 5 documentos más recientes de un curso
 *     tags: [Document]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Documentos recientes obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recentDocuments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fileName:
 *                         type: string
 *                       filePath:
 *                         type: string
 *                       bimester:
 *                         type: integer
 *                       uploadedAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al obtener los documentos recientes
 */
router.get('/getRecentDocuments/:cid', [validateJWT, getRecentDocumentsValidator], getRecentDocuments);

/**
 * @swagger
 * /document/getDocumentsProxy:
 *   get:
 *     summary: Descarga un documento remoto y lo sirve como proxy
 *     tags: [Document]
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL pública del documento a descargar
 *     responses:
 *       200:
 *         description: Documento descargado correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Falta la URL del documento
 *       404:
 *         description: Documento no encontrado
 */
router.get('/getDocumentsProxy', getDocumentProxy);

export default router;