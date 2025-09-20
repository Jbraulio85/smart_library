import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { Input } from "../Input";
import { Logo } from "../LogoMicrosoft";
import {
  validateEmail,
  validateEmailMessage,
  validatePassword,
  validatePasswordMessage,
  validateUsername,
  validateUsernameMessage,
} from "../../shared/validators";
import { useLogin } from "../../shared/hooks/useLogin";
import { getUserDetails } from "../../shared/hooks/useUserDetails";

import { EnvelopeIcon, KeyIcon } from "@heroicons/react/24/outline";

export const LoginMicrosoft = () => {
  const { login, isLoading } = useLogin();
  const navigate = useNavigate();

  const [status, setStatus] = useState("base");

  const handleLogin = useCallback(() => {
    navigate("/kinal.library/acceso");
  }, [navigate]);

  const [form, setForm] = useState({
    identifier: { value: "", isValid: false, showError: false },
    password: { value: "", isValid: false, showError: false },
  });

  const onChange = useCallback((value, field) => {
    setForm((f) => ({
      ...f,
      [field]: { ...f[field], value },
    }));
  }, []);

  const onBlur = useCallback(
    (value, field) => {
      let valid = false;
      if (field === "identifier") {
        valid = value.includes("@")
          ? validateEmail(value)
          : validateUsername(value);
      } else if (field === "password") {
        valid = validatePassword(value);
      }
      setForm((f) => ({
        ...f,
        [field]: { ...f[field], isValid: valid, showError: !valid },
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!form.identifier.isValid || !form.password.isValid) {
        toast.error("Por favor, completa todos los campos correctamente.");
        return;
      }

      setStatus("loading");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const success = await login(form.identifier.value, form.password.value);
      setStatus(success ? "success" : "error");
  }, [form, login]);

  useEffect(() => {
    if (status === "success") {
      const timeout = setTimeout(() => {
        const { role } = getUserDetails();
        switch (role) {
          case "TEACHER_ROLE":
            navigate("/kinal.library/cursos/maestro");
            break;
          case "STUDENT_ROLE":
            navigate("/kinal.library/cursos/estudiante");
            break;
          default:
            navigate("/");
            break;
        }
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [status, navigate]);

  const buttonVariants = {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: { type: "spring", stiffness: 400, damping: 10 },
  };

  const formVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  let contentToRender;

  const effectiveStatus = isLoading ? "loading" : status;

  switch (effectiveStatus) {
    case "success":
      contentToRender = (
        <motion.div
          key="success-content"
          variants={contentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col items-center text-[#1e3169]"
        >
          <p className="text-lg font-semibold">¡Inicio de sesión exitoso!</p>
          <motion.svg
            className="w-16 h-16 text-green-500 mt-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </motion.svg>
        </motion.div>
      );
      break;

    case "loading":
      contentToRender = (
        <motion.div
          key="loading-content"
          variants={contentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex flex-col items-center text-gray-600"
        >
          <p className="text-lg font-semibold">Iniciando sesión…</p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
            className="w-10 h-10 border-4 border-t-4 border-gray-200 border-t-[#163a5d] rounded-full mx-auto mt-4"
          ></motion.div>
        </motion.div>
      );
      break;

    case "error":
      contentToRender = (
        setStatus("base")
      );
      break;

    default:
      const disabled = isLoading || !form.identifier.isValid || !form.password.isValid;
      contentToRender = (
        <motion.div
          key="base-content"
          variants={contentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full flex flex-col items-center space-y-6"
        >
          <Logo text="Iniciar sesión" />

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <Input
              field="identifier"
              value={form.identifier.value}
              onChangeHandler={onChange}
              onBlurHandler={onBlur}
              showErrorMessage={form.identifier.showError}
              validationMessage={
                form.identifier.value.includes("@")
                  ? validateEmailMessage
                  : validateUsernameMessage
              }
              type="text"
              placeholder="Usuario o correo electrónico"
              Icon={EnvelopeIcon}
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
              Acceder
            </motion.button>
          </form>

          <span
            className="font-semibold text-[#1e3169] cursor-pointer"
            onClick={handleLogin}
          >
            Regresar
          </span>
        </motion.div>
      );
      break;
  }

  return (
    <motion.div
      style={{ backgroundSize: "200% 200%" }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#bcddff] to-[#ffffff]"
      initial={{ backgroundPosition: "0% 50%" }}
      animate={{ backgroundPosition: "100% 50%" }}
      transition={{
        duration: 8,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      <motion.div
        className="mx-4 sm:w-full sm:max-w-md sm:mx-auto bg-white rounded-2xl p-8 flex flex-col items-center shadow-lg"
        variants={formVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <AnimatePresence mode="wait" initial={false}>
          {contentToRender}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};