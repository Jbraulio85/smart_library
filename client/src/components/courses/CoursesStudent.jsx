import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

import { useFilterCoursesStudent } from "../../shared/hooks/useFilterCoursesStudent.jsx";
import { Spinner } from "../Spinner.jsx";

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const cardVariants = {
  initial:    { opacity: 0, scale: 0.9 },
  animate:    { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
  exit:       { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  whileHover: { scale: 1.03, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)", transition: { type: "spring", stiffness: 200, damping: 20 } },
};

export const CoursesStudent = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const { filteredCourses, fetchFilteredCourses, loading, error } = useFilterCoursesStudent();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (loading) setShowSpinner(true);
    else {
      const t = setTimeout(() => setShowSpinner(false), 500);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    fetchFilteredCourses({});
  }, [fetchFilteredCourses]);

  const handleFilter = () => {
    fetchFilteredCourses({ name: name.trim() });
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      handleFilter();
    }
  };

  const handleClear = () => {
    setName("");
    fetchFilteredCourses({});
  };

  if (showSpinner) return <Spinner />;
  if (error)       return <p className="text-center text-red-500">Error: {error}</p>;
  
  return (
    <AnimatePresence>
      <motion.div
        className="p-6"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* BARRA DE BÚSQUEDA SIN BOTÓN, SOLO ENTER */}
        <div className="w-full max-w-lg mx-auto mb-6">
          <div className="relative">
            <MagnifyingGlassIcon 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
            />
            {name && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Limpiar búsqueda"
              >
                <XMarkIcon className="w-5 h-5"/>
              </button>
            )}
            <input
              type="text"
              placeholder="Buscar por nombre de curso"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="
                w-full
                bg-white border border-gray-300
                rounded-lg
                pl-11 pr-4 py-2
                focus:outline-none focus:ring-2 focus:ring-[#1e3169] focus:border-transparent
                transition
              "
            />
          </div>
        </div>

        { filteredCourses.length > 0 ? ( 
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6" layout>
            {filteredCourses.map(course => (
              <motion.div
                key={course._id || course.cid}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="whileHover"
                layout
              >
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{course.name}</h3>
                  {course.description && (
                    <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                  )}
                  <div className="mt-1 text-sm text-gray-700">
                    <strong>Docente:</strong>{" "}
                    {course.teacher
                      ? `${course.teacher.name} ${course.teacher.surname}`
                      : "No asignado"}
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/kinal.library/cursos/${course._id || course.cid}/documentos`)
                    }
                    className="
                      mt-4 w-full text-lg text-white
                      bg-[#b8001c] hover:bg-[#a70019]
                      font-medium py-2 px-4 rounded-lg
                      transition
                    "
                  >
                    Entrar al curso
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
        <p className="text-center text-gray-500">
          { name.trim()
            ? "No se encontró ningún curso con ese nombre"
            : "No estás inscrito en ningún curso"
          }
        </p>
      )}
      </motion.div>
    </AnimatePresence>
  );
};
