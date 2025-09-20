import { body } from "express-validator";
import { emailExist, usernameExist } from "../helpers/db-validators.js";
import { validateFields } from "./validate-fields.js";
import { deleteFileOnError } from "./delete-file-on-error.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./role-validator.js";

export const registerValidator = [
    body("name", "El nombre es obligatorio").not().isEmpty(),
    body("username","El username es obligatorio").not().isEmpty(),
    body("email", "El correo es obligatorio").not().isEmpty(),
    body("email", "Ingrese un correo válido").isEmail(),    
    body("email", "El correo tiene que contener @kinal").contains("@kinal"),
    body("email").custom(emailExist),
    body("username").custom(usernameExist),
    body("password").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
    }),
    handleErrors,
    validateFields
]

export const loginValidator = [
    body("email").optional().isEmail().withMessage("No es un email válido"),
    body("username").optional().isString().withMessage("Username es en formáto erróneo"),
    body("password").isLength({ min: 4 }).withMessage("El password debe contener al menos 8 caracteres"),
    validateFields,
    handleErrors
];

export const updateUserValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "STUDENT_ROLE"),
    validateFields,
    handleErrors
]

export const deleteProfilePictureValidator = [
    validateJWT,
    hasRoles("STUDENT_ROLE"),
    validateFields,
    handleErrors
]

export const updatePasswordValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "STUDENT_ROLE"),
    body("newPassword").isLength({min: 8}).withMessage("El password debe contener al menos 8 caracteres"),
    validateFields,
    handleErrors
]

export const getUsersValidator =[
    validateJWT,
    hasRoles("ADMIN_ROLE")
]

export const deleteUserValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    validateFields,
    handleErrors
]

export const updateProfilePictureValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "STUDENT_ROLE"),
    validateFields,
    deleteFileOnError,
    handleErrors
]

export const getProfileInfoValidator = [
    validateJWT,
    hasRoles("TEACHER_ROLE", "STUDENT_ROLE"),
    validateFields,
    handleErrors
]