import { param, body } from "express-validator";
import { deleteFileOnError } from "./delete-file-on-error.js";
import { validateFields } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./role-validator.js";

export const getDocumentsValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "TEACHER_ROLE"),
    validateFields,
    handleErrors
];

export const getDocumentByIdValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "TEACHER_ROLE", "STUDENT_ROLE"),
    param("cid").isMongoId().withMessage("El ID del curso no es válido"),
    param("docId").isMongoId().withMessage("El ID del documento no es válido"),
    validateFields,
    handleErrors
];

export const editCourseDocumentValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "TEACHER_ROLE"),
    param("cid").isMongoId().withMessage("El ID del curso no es válido"),
    param("docId").isMongoId().withMessage("El ID del documento no es válido"),
    body("fileName").optional().notEmpty().withMessage("El nombre del archivo no puede estar vacío"),
    body("filePath").optional().notEmpty().withMessage("La ruta del archivo no puede estar vacía"),
    validateFields,
    handleErrors
];

export const deleteCourseDocumentValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "TEACHER_ROLE"),
    param("cid").isMongoId().withMessage("El ID del curso no es válido"),
    param("docId").isMongoId().withMessage("El ID del documento no es válido"),
    validateFields,
    handleErrors
];

export const getRecentDocumentsValidator = [
    validateJWT,
    hasRoles("STUDENT_ROLE", "TEACHER_ROLE"),
    param("cid").isMongoId().withMessage("El ID del curso no es válido"),
    validateFields,
    handleErrors
];
