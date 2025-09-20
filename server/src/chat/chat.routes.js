import { Router } from "express";
import {
  runChat,
  getHistory,
  deleteHistory,
  generateTrivia,
  checkAnswer
} from "./chat.controller.js";

import {
  chatConsultValidator,
  chatHistoryValidator,
  chatCleanValidator
} from "../middlewares/chat-validators.js";


const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Endpoints para interacción de chat y trivia con documentos PDF
 */

/**
 * @swagger
 * /chat/chatConsult:
 *   post:
 *     summary: Consulta al chat sobre un documento PDF
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - question
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL pública del documento PDF
 *               question:
 *                 type: string
 *                 description: Pregunta a realizar sobre el documento
 *     responses:
 *       200:
 *         description: Respuesta generada por el chat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 answer:
 *                   type: string
 *       400:
 *         description: Parámetros inválidos o error al procesar el PDF
 *       429:
 *         description: Límite diario de consultas alcanzado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/chatConsult",
  chatConsultValidator,
  runChat
);

/**
 * @swagger
 * /chat/history:
 *   get:
 *     summary: Obtiene el historial de preguntas y respuestas del usuario para un documento
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: docUrl
 *         schema:
 *           type: string
 *         required: true
 *         description: URL del documento PDF
 *     responses:
 *       200:
 *         description: Historial encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Falta el parámetro docUrl
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/history",
  chatHistoryValidator,
  getHistory
);

/**
 * @swagger
 * /chat/cleanHistory:
 *   delete:
 *     summary: Elimina (marca como inactivo) el historial de chat para un documento
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: docUrl
 *         schema:
 *           type: string
 *         required: true
 *         description: URL del documento PDF
 *     responses:
 *       200:
 *         description: Historial marcado como inactivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Falta el parámetro docUrl
 *       404:
 *         description: No se encontró historial activo
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
  "/cleanHistory",
  chatCleanValidator,
  deleteHistory
);

/**
 * @swagger
 * /chat/generateTrivia/{courseId}:
 *   get:
 *     summary: Genera una pregunta de trivia basada en los documentos del curso
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Pregunta de trivia generada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 triviaId:
 *                   type: string
 *                 texto:
 *                   type: string
 *                 opciones:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *       404:
 *         description: Curso no encontrado o inactivo
 *       500:
 *         description: Error al generar trivia
 */
router.get(
  "/generateTrivia/:courseId",
  generateTrivia
);

/**
 * @swagger
 * /chat/checkAnswer/{triviaId}:
 *   post:
 *     summary: Verifica si la respuesta enviada es correcta para la trivia generada
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: triviaId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la trivia generada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *                 description: Respuesta seleccionada (A, B, C o D)
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 esCorrecta:
 *                   type: boolean
 *       400:
 *         description: Faltan datos triviaId o respuesta
 *       404:
 *         description: Pregunta no encontrada o expirada
 */
router.post(
  "/checkAnswer/:triviaId",
  checkAnswer
);

export default router;