import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import { useCourseByDegree } from "../../shared/hooks/useCourseByDegree.jsx";
import { useAssignCourse } from "../../shared/hooks/useAssignCourse.jsx";
import { useUserDetails } from "../../shared/hooks/useUserDetails.jsx";
import { useGetDegrees } from "../../shared/hooks/useGetDegrees.jsx";
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
const buttonVariants = {
  whileTap:   { scale: 0.95 },
  whileHover: { scale: 1.02 },
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

export const CoursesByDegreeList = () => {
  const { courses, loading, error } = useCourseByDegree();
  const {
    assign,
    loading: assigning,
    error: assignError,
    successMessage,
  } = useAssignCourse();
  const { user } = useUserDetails();
  const { degrees, fetchDegrees } = useGetDegrees();

  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    if (loading) setShowSpinner(true);
    else {
      const t = setTimeout(() => setShowSpinner(false), 500);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    fetchDegrees();
  }, []);

  const degreeName =
    degrees.find((d) => d._id === user.degree)?.name || "";

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const openModal = (course) => {
    setSelectedCourse(course);
    setPassword("");
    setIsOpen(true);
  };
  const closeModal = () => {
    setSelectedCourse(null);
    setIsOpen(false);
    setShowPassword(false);
  };
  const handleAssign = async () => {
    if (!selectedCourse) return;
    const result = await assign(selectedCourse.cid, { password });
    if (result?.data?.success) closeModal();
  };

  if (showSpinner) return <Spinner />;
  if (error)       return <p className="text-center text-red-500">Error: {error}</p>;
  if (courses.length === 0)
    return <p className="text-center text-gray-500">No hay cursos disponibles para tu grado</p>;

  return (
    <AnimatePresence>
      <motion.div
        className="p-6"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >

        <div className="flex justify-center mb-6">
          <h2 className="text-white text-lg bg-[#1e3169] font-semibold px-4 py-3 rounded-full">
            {degreeName} grado
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatePresence initial={false} exitBeforeEnter>
            {courses.map((course) => (
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
                    <p className="text-gray-600 text-sm mt-1">
                      {course.description}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-600">
                    <strong>Docente:</strong>{" "}
                    {course.teacher
                      ? `${course.teacher.name} ${course.teacher.surname}`
                      : "No asignado"}
                  </p>
                  <button
                    onClick={() => openModal(course)}
                    className="mt-4 w-full text-lg text-white bg-[#b8001c] hover:bg-[#a70019] font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    Asignar al curso
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
              <Dialog.Title className="text-xl font-bold text-[#1e3169] text-center">
                Inscribirse a {selectedCourse?.name}
              </Dialog.Title>

              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  autoComplete="new-password"
                />
                <button
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {assignError && (
                <div className="text-red-600 text-sm flex items-center gap-2">
                  <ExclamationCircleIcon className="w-5 h-5" />
                  {assignError}
                </div>
              )}

              {successMessage && (
                <div className="text-green-600 text-sm flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  {successMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleAssign}
                  disabled={assigning}
                  variants={buttonVariants}
                  whileTap="whileTap"
                  whileHover="whileHover"
                  className="text-white bg-[#b8001c] hover:bg-[#a70019] disabled:opacity-50 px-4 py-2 rounded-full transition"
                >
                  Confirmar
                </motion.button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
};
