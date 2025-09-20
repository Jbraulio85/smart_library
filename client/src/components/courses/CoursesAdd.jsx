import React, { useEffect, useState, useCallback, useRef, Fragment } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Listbox, Transition } from "@headlessui/react";
import { useGetDegrees } from "../../shared/hooks/useGetDegrees.jsx";
import { useAddCourses } from "../../shared/hooks/useAddCourses.jsx";
import { useUsers } from "../../shared/hooks/useUsers.jsx";

function getCurrentUser() {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function CoursesAdd() {
  const navigate = useNavigate();
  const { degrees, fetchDegrees } = useGetDegrees();
  const { addCourse, isLoading } = useAddCourses();
  const { users } = useUsers();
  const user = getCurrentUser();
  const isAdmin = user?.role === "ADMIN_ROLE";

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null,
    password: "",
    teacher: "",
    degree: "",
  });
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const inputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const handleDragOver = useCallback(e => {
    e.preventDefault();
    setDragActive(true);
  }, []);
  const handleDragLeave = useCallback(e => {
    e.preventDefault();
    setDragActive(false);
  }, []);
  const handleDrop = useCallback(e => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setForm(f => ({ ...f, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);
  
  useEffect(() => {
    fetchDegrees();
  }, [fetchDegrees]);

  useEffect(() => {
    if (!isAdmin || !form.degree) {
      setFilteredTeachers([]);
      // Si el grado cambia o ya no es admin, resetea el profesor seleccionado
      if (form.teacher) {
        setForm(f => ({ ...f, teacher: "" }));
      }
      return;
    }
    const teachers = users.filter(
      u =>
        u.role === "TEACHER_ROLE" &&
        u.degree &&
        (u.degree._id === form.degree || u.degree === form.degree)
    );
    setFilteredTeachers(teachers);
    // Si el profesor seleccionado ya no está en la lista filtrada, resetea el campo teacher
    if (
      form.teacher &&
      !teachers.some(t => t._id === form.teacher || t.uid === form.teacher)
    ) {
      setForm(f => ({ ...f, teacher: "" }));
    }
  }, [users, form.degree, isAdmin, form.teacher]);

  // Esta función manejará los cambios para inputs de texto/password y Listbox (que pasan el valor directamente)
  const handleFieldChange = useCallback(
    (field) => (valueOrEvent) => {
      // Si es un evento de input nativo (ej. input text), el valor está en e.target.value
      // Si es de Listbox, el valor se pasa directamente
      const value = valueOrEvent?.target ? valueOrEvent.target.value : valueOrEvent;
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Esta función manejará específicamente la subida de archivos
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(f => ({ ...f, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  function handleRemoveImage() {
    setForm(f => ({ ...f, image: null }));
    setImagePreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password.trim().length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.password.trim() ||
      !form.degree ||
      (isAdmin && (!form.teacher || filteredTeachers.length === 0)) // Asegúrate de que form.teacher tenga un valor si es admin y hay profesores filtrados
    ) {
      toast.error("Completa todos los campos requeridos."); // Cambiado a toast.error para consistencia
      return;
    }

    const resp = await addCourse({
      name: form.name.trim(),
      description: form.description.trim(),
      password: form.password.trim(),
      degree: form.degree,
      teacher: isAdmin ? form.teacher : "", // Si no es admin, teacher es vacío
      image: form.image,
    });

    if (!resp?.error) {
      setForm({
        name: "",
        description: "",
        image: null,
        password: "",
        teacher: "",
        degree: "",
      });
      setImagePreview(null);
      toast.success("Curso creado exitosamente!"); // Mensaje de éxito

      if (user?.role === "TEACHER_ROLE") {
        navigate("/kinal.library/cursos/maestro");
        return;
      }

      navigate("/kinal.library/cursos");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <h1 className="text-2xl font-bold text-[#1e3169] mb-6 text-center">
          Crear nuevo curso
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            required
            maxLength={25}
            value={form.name}
            onChange={handleFieldChange("name")} // Usar handleFieldChange
            placeholder="Nombre del curso"
          />

          <input
            name="description"
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            required
            maxLength={100}
            value={form.description}
            onChange={handleFieldChange("description")} // Usar handleFieldChange
            placeholder="Descripción del curso"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded-md pr-10"
              required
              minLength={6}
              value={form.password}
              onChange={handleFieldChange("password")} // Usar handleFieldChange
              placeholder="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div>
            {!degrees ? ( 
              <p>Cargando grados...</p>
            ) : (
              <Listbox
                value={form.degree}
                onChange={handleFieldChange("degree")} // Usa el nuevo manejador
                disabled={isLoading} 
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
                        : "Seleccionar grado"}
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
                      {/* Opción vacía para 'Seleccionar grado' */}
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
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-2 w-2 rounded-full bg-[#800020]">
                                  </span>
                              )}
                              <span className="block truncate">Seleccionar grado</span>
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
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-2 w-2 rounded-full bg-[#800020]">
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

          {isAdmin && (
            <div>
              <label htmlFor="teacher" className="block font-semibold mb-1">Profesor</label>
              <Listbox
                value={form.teacher}
                onChange={handleFieldChange("teacher")} // Usa el nuevo manejador
                disabled={!form.degree || filteredTeachers.length === 0 || isLoading}
              >
                <div className="relative">
                  <Listbox.Button
                    className={`
                      relative w-full cursor-pointer bg-gray-100 border border-gray-300 rounded-lg
                      text-left pl-4 pr-10 py-2
                      focus:outline-none focus:ring-1 focus:ring-[#b8001c]
                      transition
                      ${form.teacher ? "text-gray-700" : "text-gray-500"}
                    `}
                  >
                    <span className="block truncate">
                      {!form.degree
                        ? "Seleccione primero un grado"
                        : filteredTeachers.length === 0
                        ? "No hay profesores para este grado"
                        : form.teacher
                        ? filteredTeachers.find((t) => (t._id || t.uid) === form.teacher)?.name + " " + filteredTeachers.find((t) => (t._id || t.uid) === form.teacher)?.surname
                        : "Seleccionar profesor"}
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
                      {/* Opción vacía para 'Seleccionar profesor' */}
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
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-2 w-2 rounded-full bg-[#800020]">
                                  </span>
                              )}
                              <span className="block truncate">Seleccionar profesor</span>
                              </>
                          )}
                      </Listbox.Option>
                      {filteredTeachers.map((t) => (
                        <Listbox.Option
                          key={t._id || t.uid}
                          value={t._id || t.uid}
                          className={({ active, selected }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active ? "bg-[#f3e5e5]" : "text-gray-900"
                            } ${selected ? "font-semibold" : "font-normal"}`
                          }
                        >
                          {({ selected }) => (
                            <>
                              {selected && (
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-2 w-2 rounded-full bg-[#800020]">
                                </span>
                              )}
                              <span className="block truncate">
                                {t.name} {t.surname}
                              </span>
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 text-center mb-2">Imagen del curso</label>

            {!imagePreview ? (
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 transition ${
                  dragActive ? "border-[#800020] bg-[#f8e1e1]" : ""
                }`}
              >
                <input
                  ref={inputRef}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange} // Usar handleFileInputChange
                />
                <p className="text-gray-500">
                  Haz clic o arrastra la imagen aquí
                </p>
              </div>
            ) : (
              <div className="mt-2 text-center">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="max-w-full max-h-64 rounded-md mb-2"
                />
                <motion.button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-2 bg-[#b8001c] text-white font-medium rounded-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Eliminar imagen
                </motion.button>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <motion.a
              onClick={() => {
                if (user?.role === "TEACHER_ROLE") {
                  navigate("/kinal.library/cursos/maestro");
                } else {
                  navigate("/kinal.library/cursos");
                }
              }}
              className="px-4 py-2 font-medium bg-gray-300 rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancelar
            </motion.a>
            <motion.button
              type="submit"
              className="px-4 py-2 bg-[#1e3169] text-white font-medium hover:bg-[#16254c] rounded-md disabled:opacity-50"
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? "Guardando..." : "Guardar curso"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}