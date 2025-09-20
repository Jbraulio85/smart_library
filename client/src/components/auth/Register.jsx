import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { AcademicCapIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import { Input } from "../Input";
import { Logo } from "../Logo";
import { DegreeSelect } from "./DegreeSelect";
import {
  validateName,
  validateNameMessage,
  validateSurname,
  validateSurnameMessage,
  validateUsername,
  validateUsernameMessage,
  validateEmail,
  validateEmailMessage,
  validatePhone,
  validatePhoneMessage,
  validatePassword,
  validatePasswordMessage,
  validatePasswordConfirm,
  validatePasswordConfirmMessage,
} from "../../shared/validators";
import { useRegister } from "../../shared/hooks/useRegister";
import { useGetDegrees } from "../../shared/hooks/useGetDegrees";

import {
  UserIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

export const Register = ({ switchAuthHandler }) => {
  const navigate = useNavigate();
  const { register, isLoading: isRegistering } = useRegister();
  const {
    degrees,
    isLoading: isLoadingDegrees,
    fetchDegrees,
  } = useGetDegrees();

  const initialState = {
    name: { value: "", isValid: false, showError: false },
    surname: { value: "", isValid: false, showError: false },
    username: { value: "", isValid: false, showError: false },
    email: { value: "", isValid: false, showError: false },
    phone: { value: "", isValid: true, showError: false },
    password: { value: "", isValid: false, showError: false },
    passwordConfirm: { value: "", isValid: false, showError: false },
    degree: { value: "", isValid: false, showError: false },
  };
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    fetchDegrees();
  }, [fetchDegrees]);

  const onChange = useCallback((value, field) => {
    setForm((f) => ({ ...f, [field]: { ...f[field], value } }));
  }, []);

  const onBlur = useCallback(
    (value, field) => {
      let valid = false;
      switch (field) {
        case "name":
          valid = validateName(value);
          break;
        case "surname":
          valid = validateSurname(value);
          break;
        case "username":
          valid = validateUsername(value);
          break;
        case "email":
          valid = validateEmail(value);
          break;
        case "phone":
          valid = !value || validatePhone(value);
          break;
        case "password":
          valid = validatePassword(value);
          break;
        case "passwordConfirm":
          valid = validatePasswordConfirm(form.password.value, value);
          break;
        case "degree":
          valid = !!value;
          break;
        default:
          valid = true;
      }
      setForm((f) => ({
        ...f,
        [field]: { ...f[field], isValid: valid, showError: !valid },
      }));
    },
    [form.password.value]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const payload = {
        name: form.name.value,
        surname: form.surname.value,
        username: form.username.value,
        email: form.email.value,
        phone: form.phone.value || undefined,
        degree: form.degree.value,
        password: form.password.value,
      };
      const { success } = await register(payload);
      if (success) navigate("/kinal.library/acceso/verificación");
    },
    [form, register, navigate]
  );

  const buttonVariants = {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  const disabled =
    isRegistering ||
    !form.name.isValid ||
    !form.surname.isValid ||
    !form.username.isValid ||
    !form.email.isValid ||
    !form.password.isValid ||
    !form.passwordConfirm.isValid ||
    !form.degree.isValid ||
    (form.phone.value && !form.phone.isValid);

  const formVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="mx-4 sm:w-full sm:max-w-md sm:mx-auto bg-white rounded-2xl p-8 flex flex-col items-center space-y-6 shadow-lg"
      variants={formVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Logo text="¡Bienvenido al registro!" />

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <Input
          field="name"
          value={form.name.value}
          onChangeHandler={onChange}
          onBlurHandler={onBlur}
          showErrorMessage={form.name.showError}
          validationMessage={validateNameMessage}
          type="text"
          placeholder="Nombres"
          Icon={UserIcon}
        />

        <Input
          field="surname"
          value={form.surname.value}
          onChangeHandler={onChange}
          onBlurHandler={onBlur}
          showErrorMessage={form.surname.showError}
          validationMessage={validateSurnameMessage}
          type="text"
          placeholder="Apellidos"
          Icon={UserIcon}
        />

        <Input
          field="username"
          value={form.username.value}
          onChangeHandler={onChange}
          onBlurHandler={onBlur}
          showErrorMessage={form.username.showError}
          validationMessage={validateUsernameMessage}
          type="text"
          placeholder="Nombre de usuario"
          Icon={UserCircleIcon}
        />

        <Input
          field="email"
          value={form.email.value}
          onChangeHandler={onChange}
          onBlurHandler={onBlur}
          showErrorMessage={form.email.showError}
          validationMessage={validateEmailMessage}
          type="email"
          placeholder="ejemplo@kinal.edu.gt"
          Icon={EnvelopeIcon}
        />

        <Input
          field="phone"
          value={form.phone.value}
          onChangeHandler={onChange}
          onBlurHandler={onBlur}
          showErrorMessage={form.phone.showError}
          validationMessage={validatePhoneMessage}
          type="tel"
          placeholder="+502 XXXX XXXX (Opcional)"
          Icon={PhoneIcon}
        />

        <DegreeSelect
          degrees={degrees}
          value={form.degree.value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isLoadingDegrees}
          showError={form.degree.showError}
        />

        <Input
          field="password"
          value={form.password.value}
          onChangeHandler={onChange}
          onBlurHandler={onBlur}
          showErrorMessage={form.password.showError}
          validationMessage={validatePasswordMessage}
          type="password"
          placeholder="Contraseña"
          Icon={KeyIcon}
        />

        <Input
          field="passwordConfirm"
          value={form.passwordConfirm.value}
          onChangeHandler={onChange}
          onBlurHandler={onBlur}
          showErrorMessage={form.passwordConfirm.showError}
          validationMessage={validatePasswordConfirmMessage}
          type="password"
          placeholder="Confirmar contraseña"
          Icon={KeyIcon}
        />

        <motion.button
          type="submit"
          disabled={disabled}
          className={`
            mt-2
            py-3
            w-full
            flex items-center justify-center
            rounded-lg
            text-white
            font-medium
            bg-[#b8001c] hover:bg-[#a70019] 
            disabled:hover:bg-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors
          `}
          variants={buttonVariants}
          whileTap="whileTap"
          whileHover="whileHover"
        >
          Crear cuenta
        </motion.button>
      </form>

      <p
        onClick={switchAuthHandler}
        className="text-[#1e3169] hover:underline cursor-pointer"
      >
        ¿Ya tienes cuenta?{" "}
        <span className="font-semibold text-[#1e3169]">Inicia sesión</span>
      </p>
    </motion.div>
  );
};

Register.propTypes = {
  switchAuthHandler: PropTypes.func.isRequired,
};
