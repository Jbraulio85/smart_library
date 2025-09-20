import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useGetCourses } from "../../shared/hooks/useGetCourses.jsx";
import { CourseDeletePage } from "./CoursesDelete.jsx";
import { CoursesUpdatePage } from "./CoursesUpdatePage.jsx";
import { Spinner } from "../Spinner.jsx";

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } }
};
const cardVariants = {
  initial:     { opacity: 0, scale: 0.9 },
  animate:     { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
  exit:        { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  whileHover:  { scale: 1.03, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)", transition: { type: "spring", stiffness: 200, damping: 20 } },
};
const buttonVariants = {
  whileTap:   { scale: 0.95 },
  whileHover: { scale: 1.02 },
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

export const CoursesList = () => {
  const { courses, fetchCourses, isLoading, error } = useGetCourses();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    if (isLoading) setShowSpinner(true);
    else {
      const t = setTimeout(() => setShowSpinner(false), 500);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (showSpinner) return <Spinner />;
  if (error)       return <p className="text-center text-red-500">{error}</p>;

  return (
    <AnimatePresence>
      <motion.div
        className="p-6"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >

        <div className="flex justify-end mb-8">
          <motion.button
            variants={buttonVariants}
            whileTap="whileTap"
            whileHover="whileHover"
            onClick={() => navigate("/kinal.library/cursos/agregar")}
            className="px-4 py-2 rounded-lg bg-[#1e3169] hover:bg-[#16254c] text-white font-semibold text-lg transition"
          >
            Agregar Curso
          </motion.button>
        </div>

        {courses.length === 0 ? (
          <p className="text-center text-gray-600">No se han creado cursos todavía</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {courses.map(course => (
              <motion.div
                key={course.cid}
                className="bg-white rounded-2xl shadow-md overflow-hidden w-full max-w-md"
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
                  {course.teacher?.name && (
                    <p className="text-gray-600 text-sm mt-1">
                      <strong>Profesor:</strong> {course.teacher.name} {course.teacher.surname}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Grado:</strong> {course.degree?.name || "Sin grado asignado"}
                  </p>

                  <div className="mt-4 space-y-2">
                    <CourseDeletePage id={course.cid} onDeleted={fetchCourses} />

                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="w-full text-lg text-white bg-[#1e3169] hover:bg-[#16254c] disabled:opacity-50 font-medium py-2 px-4 rounded-lg transition"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => navigate(`/kinal.library/cursos/${course.cid}/documentos`)}
                      className="w-full text-lg text-white bg-[#1e3169] hover:bg-[#16254c] disabled:opacity-50 font-medium py-2 px-4 rounded-lg transition"
                    >
                      Entrar al curso
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <CoursesUpdatePage
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
            onUpdated={fetchCourses}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
