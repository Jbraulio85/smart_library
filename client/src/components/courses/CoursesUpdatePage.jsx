import React, { useState, useEffect, useRef, useCallback, Fragment } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { XMarkIcon, EyeIcon, EyeSlashIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useCoursePassword } from "../../shared/hooks/useCoursePassword.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateCourse } from "../../shared/hooks/useUpdateCourse.jsx";
import { useUpdateCoursePassword } from "../../shared/hooks/useUpdatePasswordCourse.jsx";
import { useUpdateProfilePicture } from "../../shared/hooks/useUpdateCoursePicture.jsx";
import { useGetDegrees } from "../../shared/hooks/useGetDegrees.jsx";
import { Listbox, Transition } from "@headlessui/react";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 18 } },
  exit: { opacity: 0, scale: 0.85, y: 30, transition: { duration: 0.15 } },
};

const buttonVariants = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.02 },
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

const INITIAL_FORM = (course) => ({
  name: course?.name || "",
  description: course?.description || "",
  password: "",
  degree: course?.degree?._id || "",
});

export const CoursesUpdatePage = ({ course, onClose, onUpdated }) => {
  const { courseUpdate, isLoading: loadingUpdate } = useUpdateCourse();
  const { updatePassword, isLoading: loadingPassword } = useUpdateCoursePassword();
  const { coursePictureUpdate, isLoading: loadingPhoto } = useUpdateProfilePicture();
  const { password, loading: loadingPasswordFetch, error, fetchCoursePassword } = useCoursePassword();
  const { degrees, isLoading: loadingDegrees, fetchDegrees } = useGetDegrees();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM(course));
  const [previewImage, setPreviewImage] = useState(null);

  const original = useRef({
    name: course?.name || "",
    description: course?.description || "",
    degree: course?.degree?._id || "",
  });

  const fileInputRef = useRef(null);

  useEffect(() => { fetchDegrees(); }, [fetchDegrees]);

  useEffect(() => { setPreviewImage(null); }, [course]);

  useEffect(() => {
    if (course?.cid) fetchCoursePassword(course.cid);
  }, [course?.cid]);

  useEffect(() => {
    return () => { if (previewImage) URL.revokeObjectURL(previewImage); };
  }, [previewImage]);

  const handleFormChange = useCallback(
    (field) => (valueOrEvent) => {
      const value = valueOrEvent?.target ? valueOrEvent.target.value : valueOrEvent;
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);

    try {
      const formData = new FormData();
      formData.append("image", file);
      await toast.promise(
        coursePictureUpdate(course.cid, formData),
        {
          loading: "Subiendo imagen...",
          success: "Imagen actualizada!",
          error: "Error al subir imagen.",
        }
      );
      onUpdated();
      onClose();
    } catch (error) {
      setPreviewImage(null);
      console.error("Error al subir imagen:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const dataToUpdate = {};
    if (form.name !== original.current.name) dataToUpdate.name = form.name;
    if (form.description !== original.current.description) dataToUpdate.description = form.description;
    if (form.degree !== original.current.degree) dataToUpdate.degree = form.degree;

    if (Object.keys(dataToUpdate).length === 0) {
      toast("No hay cambios para actualizar");
      return;
    }

    try {
      console.log("🛠 payload a enviar:", dataToUpdate);

      await toast.promise(
        courseUpdate({ cid: course.cid, fieldsToUpdate: dataToUpdate }),

        {
          loading: "Actualizando curso...",
          success: "Curso actualizado con éxito!",
          error: "Error al actualizar curso.",
        }
      );
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Error al actualizar curso:", err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!form.password) {
      toast.error("Debe ingresar una nueva contraseña");
      return;
    }
    try {
      await toast.promise(
        updatePassword({ cid: course.cid, newPassword: form.password }),
        {
          loading: "Cambiando contraseña...",
          success: "Contraseña actualizada!",
          error: "Error al actualizar contraseña.",
        }
      );
      setTimeout(() => setForm((prev) => ({ ...prev, password: "" })), 300);
      fetchCoursePassword(course.cid);
    } catch (err) {
      console.error("Error al actualizar contraseña:", err);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.25)" }}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      />
      <motion.div
        key="modal"
        className="fixed inset-0 flex items-center justify-center z-50 px-4 overflow-auto"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div
          className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-3 left-3 text-gray-500 hover:text-gray-800">
            <XMarkIcon className="h-8 w-8" />
          </button>

          <div className="flex flex-col items-center mb-6 mt-6">
            <div className="w-60 h-30 bg-gray-200 rounded-lg overflow-hidden flex justify-center items-center">
              {previewImage ? (
                <img src={previewImage} alt="Vista previa" className="object-contain w-full h-full" />
              ) : course.image ? (
                <img src={course.image} alt="Curso" className="object-contain w-full h-full" />
              ) : (
                <span>Sin Imagen</span>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={loadingPhoto}
            />
            <motion.button
              onClick={handlePhotoClick}
              disabled={loadingPhoto}
              variants={buttonVariants}
              whileTap="whileTap"
              whileHover="whileHover"
              className="mt-3 px-4 py-2 bg-[#1e3169] text-white font-medium rounded hover:bg-[#16254c] disabled:opacity-50"
            >
              {loadingPhoto ? "Subiendo..." : "Cambiar Imagen"}
            </motion.button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <InputField
              label="Nombre"
              value={form.name}
              onChange={handleFormChange("name")}
              type="text"
            />
            <InputField
              label="Descripción"
              value={form.description}
              onChange={handleFormChange("description")}
              textarea
            />
            <div>
              <label className="block font-semibold mb-1">Grado</label>
              {loadingDegrees ? (
                <p>Cargando grados...</p>
              ) : (
                <Listbox
                  value={form.degree}
                  onChange={handleFormChange("degree")}
                  disabled={loadingDegrees}
                >
                  <div className="relative">
                    <Listbox.Button
                      className={`
                        relative w-full cursor-pointer bg-white border border-black rounded-lg
                        text-left pl-4 pr-10 py-2
                        focus:outline-none focus:ring-1 focus:ring-[#b8001c]
                        transition
                        ${form.degree ? "text-gray-700" : "text-gray-500"}
                      `}
                    >
                      <span className="block truncate">
                        {form.degree
                          ? degrees.find((deg) => deg._id === form.degree)?.name
                          : "Selecciona un grado"}
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
                        <Listbox.Option
                            value=""
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
                                <span className="block truncate">Selecciona un grado</span>
                                </>
                            )}
                        </Listbox.Option>
                        {degrees.map((deg) => (
                          <Listbox.Option
                            key={deg._id}
                            value={deg._id}
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
                                  {deg.name}
                                </span>
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              )}
            </div>
            {/* FIN DE LA IMPLEMENTACIÓN */}
            <motion.button
              type="submit"
              disabled={loadingUpdate}
              variants={buttonVariants}
              whileTap="whileTap"
              whileHover="whileHover"
              className="w-full bg-green-600 text-white font-medium py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loadingUpdate ? "Actualizando..." : "Actualizar Curso"}
            </motion.button>
          </form>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-center mb-2">Contraseña actual del curso</h3>
            {loadingPasswordFetch ? (
              <p className="text-center text-gray-600">Cargando contraseña...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <input
                type="text"
                value={password || ""}
                readOnly
                className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-800"
              />
            )}
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-center">Cambiar Contraseña</h3>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleFormChange("password")}
                className="w-full border px-3 py-2 rounded"
                placeholder="Nueva contraseña"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            <motion.button
              type="submit"
              disabled={loadingPassword}
              variants={buttonVariants}
              whileTap="whileTap"
              whileHover="whileHover"
              className="w-full bg-[#1e3169] text-white font-medium py-2 rounded hover:bg-[#16254c] disabled:opacity-50"
            >
              {loadingPassword ? "Actualizando..." : "Cambiar Contraseña"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

function InputField({ label, value, onChange, type = "text", textarea = false }) {
  return (
    <div>
      <label className="block font-semibold mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          className="w-full border px-3 py-2 rounded"
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full border px-3 py-2 rounded"
        />
      )}
    </div>
  );
}

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  textarea: PropTypes.bool,
};

CoursesUpdatePage.propTypes = {
  course: PropTypes.shape({
    cid: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    degree: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdated: PropTypes.func.isRequired,
};