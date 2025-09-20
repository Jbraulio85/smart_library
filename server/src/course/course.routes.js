import { Router } from "express";
import { createCourse, 
    getCourses, 
    updateCoursePicture, 
    updateCoursePassword, 
    deleteCourse, 
    updateCourse, 
    assignCourse,
    getCoursePassword,
    uploadDocumentToCourse,
    getMyCourses,
    filterCoursesStudent,
    getCoursesByTeacher,
    getCourseById,
    getCourseId,
    getDocumentsByBimester,
    deleteDocumentFromCourse 
} 
    from "./course.controller.js";

import { createCourseValidator, 
    getCoursesValidator, 
    updateImageCourseValidator, 
    updatePasswordValidator,
    deleteCourseValidator,
    updateCourseValidator, 
    assignCourseValidator,
    getPasswordCourseValidator,
    uploadCourseDocumentValidator,
    getMyCoursesValidator,
    filterCourseStudentValidator,
    getCoursesByTeacherValidator,
    getCourseByIdValidator,
    getCourseIdValidator,
    getDocumentsByBimesterValidator,
    deleteDocumentValidator
} 
    from "../middlewares/course-validator.js";

import { uploadCourseImage, uploadDocument } from "../middlewares/multer-upload.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Course
 *   description: Endpoints para la gestión de cursos, documentos y asignaciones
 */

/**
 * @swagger
 * /course/addCourse:
 *   post:
 *     summary: Crea un nuevo curso
 *     tags: [Course]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del curso (opcional)
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               degree:
 *                 type: string
 *               teacher:
 *                 type: string
 *     responses:
 *       201:
 *         description: Curso creado correctamente
 *       400:
 *         description: Datos inválidos o profesor no válido
 *       500:
 *         description: Error al crear el curso
 */
router.post("/addCourse", uploadCourseImage.single("image"),  createCourseValidator, createCourse);

/**
 * @swagger
 * /course/getCourses:
 *   get:
 *     summary: Obtiene todos los cursos activos
 *     tags: [Course]
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
 *         description: Lista de cursos
 *       500:
 *         description: Error al obtener los cursos
 */
router.get("/getCourses", getCoursesValidator, getCourses);

/**
 * @swagger
 * /course/updateCoursePicture/{cid}:
 *   patch:
 *     summary: Actualiza la imagen de un curso
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen actualizada correctamente
 *       400:
 *         description: No se envió una imagen válida
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al actualizar la imagen
 */
router.patch("/updateCoursePicture/:cid", uploadCourseImage.single("image"), updateImageCourseValidator, updateCoursePicture);

/**
 * @swagger
 * /course/updateCoursePassword/{cid}:
 *   patch:
 *     summary: Actualiza la contraseña de un curso
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Falta la nueva contraseña
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al actualizar la contraseña
 */
router.patch("/updateCoursePassword/:cid", updatePasswordValidator, updateCoursePassword);

/**
 * @swagger
 * /course/deleteCourse/{cid}:
 *   delete:
 *     summary: Elimina (desactiva) un curso
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Curso eliminado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al eliminar el curso
 */
router.delete("/deleteCourse/:cid", deleteCourseValidator, deleteCourse);

/**
 * @swagger
 * /course/updateCourse/{cid}:
 *   put:
 *     summary: Actualiza los datos de un curso
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Curso actualizado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al actualizar el curso
 */
router.put("/updateCourse/:cid", updateCourseValidator, updateCourse);

/**
 * @swagger
 * /course/assignCourse/{cid}:
 *   patch:
 *     summary: Inscribe a un estudiante en un curso usando contraseña
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inscripción exitosa
 *       400:
 *         description: Contraseña incorrecta o ya inscrito
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al inscribirse
 */
router.patch("/assignCourse/:cid", assignCourseValidator, assignCourse);

/**
 * @swagger
 * /course/getCoursePassword/{cid}:
 *   get:
 *     summary: Obtiene la contraseña de un curso (solo profesor o admin)
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Contraseña obtenida exitosamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al obtener la contraseña
 */
router.get("/getCoursePassword/:cid", getPasswordCourseValidator, getCoursePassword);

/**
 * @swagger
 * /course/uploadDocument/{cid}:
 *   post:
 *     summary: Sube un documento PDF a un curso
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               bimester:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Documento subido correctamente
 *       400:
 *         description: Archivo inválido o bimestre incorrecto
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al subir el documento
 */
router.post("/uploadDocument/:cid", uploadDocument.single("document"), uploadCourseDocumentValidator, uploadDocumentToCourse);

/**
 * @swagger
 * /course/getMyCourses:
 *   get:
 *     summary: Obtiene los cursos asignados al usuario autenticado
 *     tags: [Course]
 *     responses:
 *       200:
 *         description: Lista de cursos asignados
 *       500:
 *         description: Error al obtener los cursos
 */
router.get("/getMyCourses", getMyCoursesValidator, getMyCourses);

/**
 * @swagger
 * /course/courseFilterStudent:
 *   post:
 *     summary: Filtra los cursos asignados al estudiante por nombre y orden
 *     tags: [Course]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sort:
 *                 type: object
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cursos filtrados
 *       500:
 *         description: Error al obtener los cursos
 */
router.post("/courseFilterStudent",filterCourseStudentValidator,filterCoursesStudent)

/**
 * @swagger
 * /course/getCoursesByTeacher:
 *   get:
 *     summary: Obtiene los cursos creados por el profesor autenticado
 *     tags: [Course]
 *     responses:
 *       200:
 *         description: Lista de cursos del profesor
 *       500:
 *         description: Error al obtener los cursos
 */
router.get("/getCoursesByTeacher", getCoursesByTeacherValidator, getCoursesByTeacher);

/**
 * @swagger
 * /course/getCourseById:
 *   get:
 *     summary: Obtiene los cursos del grado del usuario autenticado
 *     tags: [Course]
 *     responses:
 *       200:
 *         description: Cursos obtenidos correctamente
 *       404:
 *         description: Cursos no encontrados
 *       500:
 *         description: Error al obtener los cursos
 */
router.get("/getCourseById", getCourseByIdValidator,getCourseById);

/**
 * @swagger
 * /course/getCourseId/{cid}:
 *   get:
 *     summary: Obtiene la información de un curso por su ID
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Curso encontrado
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error al obtener el curso
 */
router.get("/getCourseId/:cid", getCourseIdValidator, getCourseId);

/**
 * @swagger
 * /course/getDocumentsByBimester/{cid}:
 *   post:
 *     summary: Obtiene los documentos de un curso por bimestre
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bimester:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Documentos encontrados
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Curso o grado no encontrado
 *       500:
 *         description: Error al obtener documentos
 */
router.post("/getDocumentsByBimester/:cid", getDocumentsByBimesterValidator, getDocumentsByBimester);

/**
 * @swagger
 * /course/{cid}/document/{did}:
 *   patch:
 *     summary: Elimina (marca como inactivo) un documento de un curso
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *       - in: path
 *         name: did
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del documento
 *     responses:
 *       200:
 *         description: Documento eliminado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Curso o documento no encontrado
 *       500:
 *         description: Error al eliminar el documento
 */
router.patch("/:cid/document/:did", deleteDocumentValidator, deleteDocumentFromCourse);

export default router;