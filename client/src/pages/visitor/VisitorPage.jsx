import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  BookOpenIcon,
  ArrowDownTrayIcon,
  CpuChipIcon,
} from "@heroicons/react/24/solid";

import LibraryVisitorImage from "../../assets/img/VisitorImage.jpg";

export const VisitorPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/kinal.library/acceso");
  };

  const buttonVariants = {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: { type: "spring", stiffness: 400, damping: 10 },
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <motion.section
        className="relative w-full bg-[#1e3169] text-white flex flex-col-reverse md:flex-row items-center justify-center px-6 py-12 md:py-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="z-10 max-w-xl text-center md:text-left"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Bienvenido a Biblioteca Virtual con IA
          </h1>
          <p className="text-base md:text-lg mb-6">
            Encuentra aquí todos los materiales en PDF que tus profesores
            comparten. Descarga apuntes, guías de estudio y recursos
            educativos para complementar tus clases con la ayuda de la
            inteligencia artificial.
          </p>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 justify-center md:justify-start">
            <motion.button
              className="bg-[#b8001c] hover:bg-[#a70019] text-white font-semibold text-base md:text-lg px-8 py-3 rounded-lg transition-colors shadow-md"
              onClick={handleLogin}
              variants={buttonVariants}
              whileTap="whileTap"
              whileHover="whileHover"
            >
              Comenzar
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="mb-8 md:mb-0 md:ml-12 flex-shrink-0"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-56 h-56 md:w-80 md:h-80 bg-white rounded-full shadow-lg overflow-hidden flex items-center justify-center">
            <img
              src={LibraryVisitorImage}
              alt="Biblioteca Virtual Fundación Kinal"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </motion.section>

      <main className="flex-grow bg-gray-50 py-16 px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-[#16233F] text-center mb-10">
            ¿Qué Puedes Hacer Aquí?
          </h2>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3 justify-items-center">
          <motion.div
            className="group bg-white rounded-xl p-6 shadow-md hover:-translate-y-1 hover:shadow-lg transition-transform"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-[#b8001c] text-white rounded-full flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#1e3169] text-center mb-2">
              Buscar Material
            </h3>
            <p className="text-gray-600 text-sm text-center mb-4">
              Explora el catálogo de PDFs organizados por asignatura y profesor.
              Filtra por curso, materia o año.
            </p>
          </motion.div>

          <motion.div
            className="group bg-white rounded-xl p-6 shadow-md hover:-translate-y-1 hover:shadow-lg transition-transform"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-[#b8001c] text-white rounded-full flex items-center justify-center">
                <ArrowDownTrayIcon className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#1e3169] text-center mb-2">
              Descargar PDFs
            </h3>
            <p className="text-gray-600 text-sm text-center mb-4">
              Una vez que encuentres el recurso, descárgalo al instante para
              consultarlo desde tu dispositivo.
            </p>
          </motion.div>

          <motion.div
            className="group bg-white rounded-xl p-6 shadow-md hover:-translate-y-1 hover:shadow-lg transition-transform"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-[#b8001c] text-white rounded-full flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-[#1e3169] text-center mb-2">
              Apóyate de la IA
            </h3>
            <p className="text-gray-600 text-sm text-center mb-4">
              ¿Necesitas ayuda extra? Utiliza la IA para resolver tus dudas al
              instante y enriquecer tu búsqueda de recursos.
            </p>
          </motion.div>
        </div>
      </main>

      <footer className="bg-gray-200 text-center py-6 text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} Biblioteca Virtual Desarrollada por
          Kinal. Todos los derechos reservados.
        </p>
        <p className="mt-1">
          <a href="#" className="underline hover:text-gray-700">
            Términos y Condiciones
          </a>{" "}
          ·{" "}
          <a href="#" className="underline hover:text-gray-700">
            Política de Privacidad
          </a>
        </p>
      </footer>
    </div>
  );
};
