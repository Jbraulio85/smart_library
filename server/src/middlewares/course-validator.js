import { body, param } from "express-validator";
import { deleteFileOnError } from "./delete-file-on-error.js";
import { validateFields } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./role-validator.js";
import { isUnique } from "../helpers/db-validators.js";

export const createCourseValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "ADMIN_ROLE"),
    body("name").notEmpty().withMessage("El nombre del curso es obligatorio"),
    body("name").custom(isUnique).withMessage("El nombre del curso ya existe"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const getCoursesValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "ADMIN_ROLE"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const updateImageCourseValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "ADMIN_ROLE"),
    param("cid").isMongoId().withMessage("El id del curso no es válido"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const updatePasswordValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "ADMIN_ROLE"),
    body("newPassword").isLength({min: 6}).withMessage("El password debe contener al menos 6 caracteres"),
    validateFields,
    handleErrors
]

export const deleteCourseValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "ADMIN_ROLE"),
    param("cid").isMongoId().withMessage("El id del curso no es válido"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const updateCourseValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "ADMIN_ROLE"),
    param("cid").isMongoId().withMessage("El id del curso no es válido"),
    body("name").custom(isUnique).withMessage("El nombre del curso ya existe"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const assignCourseValidator = [
    validateJWT,
    hasRoles("STUDENT_ROLE"),
    param("cid").isMongoId().withMessage("El id del curso no es válido"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const getPasswordCourseValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "ADMIN_ROLE"),
    param("cid").isMongoId().withMessage("El id del curso no es válido"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const uploadCourseDocumentValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "ADMIN_ROLE"),
    param("cid").isMongoId().withMessage("El id del curso no es válido"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const getMyCoursesValidator = [
    validateJWT,
    hasRoles("STUDENT_ROLE"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const filterCourseStudentValidator = [
    validateJWT,
    hasRoles("STUDENT_ROLE"),
    validateFields,
    handleErrors
]

export const getCoursesByTeacherValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE"),
    validateFields,
    deleteFileOnError,
    handleErrors
]


export const filterCoursesTeacherValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE"),
    validateFields,
    handleErrors
]

export const getCourseByIdValidator = [
    validateJWT,
    hasRoles("STUDENT_ROLE"),
    validateFields,
    handleErrors
]

export const getCourseIdValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "ADMIN_ROLE", "STUDENT_ROLE"),
    validateFields,
    handleErrors
]

export const getDocumentsByBimesterValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "STUDENT_ROLE", "ADMIN_ROLE"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const deleteDocumentValidator = [
  validateJWT,
  hasRoles("TEACHER_ROLE", "ADMIN_ROLE"),
  param("cid").isMongoId().withMessage("El id del curso no es válido"),
  param("did").isMongoId().withMessage("El id del documento no es válido"),
  validateFields,
  handleErrors
];