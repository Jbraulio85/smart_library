import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import toast from "react-hot-toast";
import { useVerifyEmail } from "../../shared/hooks/useVerifyEmail";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const { verify, isLoading } = useVerifyEmail();

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("idle");

  const inputsRef = useRef([]);

  const handleChange = useCallback((e, idx) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[idx] = val;
    setDigits(newDigits);

    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  }, [digits]);

  const handleKeyDown = useCallback((e, idx) => {
    if (e.key === "Backspace" && digits[idx] === "") {
      if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
    }
  }, [digits]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      toast.error("El código debe tener 6 dígitos.");
      return;
    }

    setStatus("loading");

    await new Promise(resolve => setTimeout(resolve, 1500));

    const ok = await verify(code);
    setStatus(ok ? "success" : "error");
  }, [digits, verify]);

  useEffect(() => {
    if (status === "success") {
      const timeout = setTimeout(() => {
        navigate("/kinal.library/acceso");
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [status, navigate]);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 15,
      },
    },
  };

  const buttonVariants = {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.05 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  let contentToRender;
  let currentCardBgColor = "bg-white";
  let currentTextColor = "text-[#1e3169]";

  const effectiveStatus = isLoading ? "loading" : status;

  switch (effectiveStatus) {
    case "success":
      contentToRender = (
        <motion.div key="success-content" variants={contentVariants} initial="initial" animate="animate" exit="exit">
          <p className="text-lg font-semibold">
            ¡Verificación exitosa!
          </p>
        </motion.div>
      );
      break;

    case "loading":
      currentCardBgColor = "bg-white";
      currentTextColor = "text-gray-600";
      contentToRender = (
        <motion.div key="loading-content" variants={contentVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center">
          <p className="text-gray-600 text-lg font-semibold">Verificando código…</p>
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
        <motion.div key="error-content" variants={contentVariants} initial="initial" animate="animate" exit="exit">
          <p className="text-[#b8001c] font-semibold mb-6">
            El código ingresado es inválido o ha expirado
          </p>
          <motion.button
            className="w-60 py-3 mb-4 rounded-full bg-[#b8001c] hover:opacity-90 text-white font-semibold transition"
            onClick={() => {
              setStatus("idle");
              setDigits(["", "", "", "", "", ""]);
              inputsRef.current[0]?.focus();
            }}
            variants={buttonVariants}
            whileTap="whileTap"
            whileHover="whileHover"
          >
            Intentar de nuevo
          </motion.button>
          
          <button
            className="w-full mt-3 text-[#1e3169] hover:underline font-semibold"
            onClick={() => navigate("/kinal.library/acceso")}
          >
            Volver al inicio
          </button>
        </motion.div>
      );
      break;

    default:
      const isButtonEnabled = digits.every((d) => d !== "") && !isLoading;
      contentToRender = (
        <motion.div key="idle-content" variants={contentVariants} initial="initial" animate="animate" exit="exit">
          <h2 className="font-bold text-2xl mb-4">Escriba su código</h2>
          <p className="text-[#1e3169] mb-6">
            Escriba el código que enviamos a su correo electrónico.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digits[idx]}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  className="w-10 h-12 text-center text-2xl border-b-2 border-gray-300 focus:border-[#b8001c] focus:outline-none"
                />
              ))}
            </div>

            <motion.button
              type="submit"
              disabled={!isButtonEnabled}
              className={`
                w-60 
                py-3 
                rounded-full 
                text-white
                ${isButtonEnabled
                  ? "bg-[#b8001c] hover:opacity-90"
                  : "bg-[#de7b8a]"}
                font-semibold transition
              `}
              style={{ cursor: isButtonEnabled ? "pointer" : "default" }}
              variants={buttonVariants}
              whileTap="whileTap"
              whileHover="whileHover"
            >
              {isLoading ? "Verificando..." : "Verificar"}
            </motion.button>
          </form>

          <button
            className="mt-6 text-[#1e3169] hover:underline font-semibold"
            onClick={() => navigate("/kinal.library/acceso")}
          >
            Cancelar y volver
          </button>
        </motion.div>
      );
      break;
  }

  return (
    <motion.div
      style={{ backgroundSize: "200% 200%" }}
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-[#bcddff] to-[#ffffff]"
      initial={{ backgroundPosition: "0% 50%" }}
      animate={{ backgroundPosition: "100% 50%" }}
      transition={{
        duration: 8,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <motion.div
        className={`${currentCardBgColor} p-8 rounded-2xl shadow-lg max-w-md w-full text-center ${currentTextColor}`}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        key="verify-email-main-card"
      >
        <AnimatePresence mode="wait" initial={false}>
            {contentToRender}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};