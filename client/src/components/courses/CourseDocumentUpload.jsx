import React, { useState, useEffect, useCallback, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { useUploadDocument } from "../../shared/hooks/useUploadDocument.jsx";
import { useCourseId } from "../../shared/hooks/useCourseId.jsx";
import { Spinner } from "../Spinner.jsx";

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } },
};
const formVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};
const fieldVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};
const buttonVariants = {
  whileTap:  { scale: 0.95 },
  whileHover:{ scale: 1.02 },
  transition:{ type: "spring", stiffness: 400, damping: 10 },
};

export const CourseDocumentUpload = () => {
  const { cid } = useParams();
  const navigate = useNavigate();

  // Estado datos curso
  const { course, loading: courseLoading, error: courseError } = useCourseId(cid);
  // Estado subida
  const {
    loading: uploadLoading,
    error: uploadError,
    success,
    uploadDocument,
  } = useUploadDocument();

  // UI state
  const [file, setFile]           = useState(null);
  const [bimester, setBimester]   = useState("");
  const [maxBimesters, setMaxBimesters] = useState(5);
  const [error, setError]         = useState("");

  // Calcular bimestres según grado
  useEffect(() => {
    if (course?.degree?.name) {
      const name = course.degree.name.toLowerCase();
      setMaxBimesters(
        name === "sexto"
          ? 3
          : ["cuarto", "quinto"].some(n => name.includes(n))
            ? 4
            : 5
      );
    }
  }, [course]);

  // Validación del archivo
  const handleFile = useCallback((f) => {
    setError("");
    if (!f) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowed.includes(f.type)) {
      setError("Solo PDF o Word (.doc, .docx).");
      setFile(null);
      return;
    }
    if (f.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        const arr = new Uint8Array(reader.result);
        const text = new TextDecoder("latin1").decode(arr);
        if (text.includes("/Subtype /Image")) {
          setError("El PDF contiene imágenes. Elimina las imágenes.");
          setFile(null);
        } else {
          setFile(f);
        }
      };
      reader.readAsArrayBuffer(f);
    } else {
      setFile(f);
    }
  }, []);

  // Drag & drop y file input
  const onDrop      = e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };
  const onDragOver  = e => e.preventDefault();
  const handleSelect= e => handleFile(e.target.files[0]);

  // Opciones de bimestre
  const bimesterOptions = Array.from({ length: maxBimesters }, (_, i) => i + 1);

  // Envío del formulario
  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) {
      setError("Debes seleccionar un archivo válido");
      return;
    }
    if (!bimester) {
      setError("Selecciona un bimestre.");
      return;
    }
    await uploadDocument(cid, file, bimester);
    if (!uploadError) {
      setTimeout(() => navigate(`/kinal.library/cursos/${cid}/documentos`), 1500);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="p-8 min-h-screen flex flex-col items-center"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md max-w-md w-full space-y-6"
          variants={formVariants}
        >
          {courseLoading ? (
            <motion.div variants={fieldVariants}>
              <Spinner />
            </motion.div>
          ) : courseError ? (
            <motion.p className="text-red-500" variants={fieldVariants}>
              Error al cargar el curso
            </motion.p>
          ) : (
            <>
              {/* Título + Selector de bimestre con Headless UI */}
              <motion.div variants={fieldVariants}>
                <h2 className="text-2xl text-gray-500 font-bold mb-4 text-center">
                  Subir documento al curso
                </h2>

                <Listbox
                  value={bimester}
                  onChange={val => setBimester(val)}
                  disabled={courseLoading}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`
                        relative w-full cursor-pointer bg-gray-100 border border-gray-300 rounded-lg
                        text-left pl-4 pr-10 py-2
                        focus:outline-none focus:ring-1 focus:ring-[#b8001c]
                        transition
                        ${bimester ? "text-gray-700" : "text-gray-500"}
                      `}
                    >
                      <span className="block truncate">
                        {bimester ? `Bimestre ${bimester}` : "Selecciona el bimestre"}
                      </span>
                      <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"/>
                    </Listbox.Button>

                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options
                        className="
                          absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white
                          py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
                        "
                      >
                        {bimesterOptions.map(num => (
                          <Listbox.Option
                            key={num}
                            value={num}
                            className={({ active, selected }) =>
                              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                active ? "bg-[#f3e5e5]" : "text-gray-900"
                              } ${selected ? "font-semibold" : "font-normal"}`
                            }
                          >
                            {({ selected }) => (
                              <>
                                {selected && (
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#800020]">
                                    ●
                                  </span>
                                )}
                                <span className="block truncate">
                                  Bimestre {num}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </motion.div>

              {/* Zona de arrastrar/seleccionar archivo */}
              <motion.div
                onDrop={onDrop}
                onDragOver={onDragOver}
                variants={fieldVariants}
              >
                <label
                  htmlFor="fileInput"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer
                             hover:border-[#800020] hover:bg-[#f8e1e1] transition text-gray-600 py-16 text-center"
                >
                  {file ? (
                    <p className="text-gray-800">{file.name}</p>
                  ) : (
                    <>
                      <span>Arrastra tu archivo aquí</span>
                      <small className="text-gray-400 mt-1">(o haz click)</small>
                    </>
                  )}
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleSelect}
                  className="hidden"
                />
              </motion.div>

              {/* Mensajes de error / éxito */}
              <AnimatePresence>
                {(error || uploadError) && (
                  <motion.p className="text-red-500" variants={fieldVariants}>
                    {error || uploadError}
                  </motion.p>
                )}
                {success && (
                  <motion.p className="text-green-600" variants={fieldVariants}>
                    {success}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Botones */}
              <motion.div className="flex items-center" variants={fieldVariants}>
                <motion.button
                  type="submit"
                  disabled={uploadLoading}
                  variants={buttonVariants}
                  whileTap="whileTap"
                  whileHover="whileHover"
                  className="text-white bg-[#b8001c] hover:bg-[#a70019] px-6 py-2 rounded transition disabled:opacity-50"
                >
                  {uploadLoading ? "Subiendo..." : "Subir"}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => navigate(-1)}
                  variants={buttonVariants}
                  whileTap="whileTap"
                  whileHover="whileHover"
                  className="ml-6 text-gray-600 underline"
                >
                  Cancelar
                </motion.button>
              </motion.div>
            </>
          )}
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
};
