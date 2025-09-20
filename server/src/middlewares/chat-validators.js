import { body, query } from "express-validator";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./role-validator.js";
import { validateFields } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";

export const chatConsultValidator = [
  validateJWT,
  hasRoles("TEACHER_ROLE", "STUDENT_ROLE", "ADMIN_ROLE"),
  body("url")
    .notEmpty().withMessage("La URL es obligatoria")
    .isURL().withMessage("Debe ser una URL válida"),
  body("question")
    .notEmpty().withMessage("La pregunta es obligatoria")
    .isString().withMessage("La pregunta debe ser texto"),
  validateFields,
  handleErrors,
];

export const chatHistoryValidator = [
  validateJWT,
  hasRoles("TEACHER_ROLE", "STUDENT_ROLE", "ADMIN_ROLE"),
  query("docUrl")
    .notEmpty().withMessage("El parámetro docUrl es obligatorio")
    .isString().withMessage("docUrl debe ser texto"),
  validateFields,
  handleErrors,
];

export const chatCleanValidator = [
  validateJWT,
  hasRoles("TEACHER_ROLE", "STUDENT_ROLE", "ADMIN_ROLE"),
  query("docUrl")
    .notEmpty().withMessage("El parámetro docUrl es obligatorio")
    .isString().withMessage("docUrl debe ser texto"),
  validateFields,
  handleErrors,
];
