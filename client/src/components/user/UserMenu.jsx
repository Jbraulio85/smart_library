import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

import { useDeleteProfilePicture } from "../../shared/hooks/useDeleteProfilePicture.jsx";
import { useUpdatePassword } from "../../shared/hooks/useUpdatePassword.jsx";
import { useUpdateProfile } from "../../shared/hooks/useUpdateProfile.jsx";
import { useUpdateProfilePicture } from "../../shared/hooks/useUpdateProfilePicture.jsx";
import { useUserDetails } from "../../shared/hooks/useUserDetails.jsx";
import { useGetDegrees } from "../../shared/hooks/useGetDegrees.jsx";

import {
  validateEmail,
  validateEmailMessage,
  validatePassword,
  validatePasswordMessage
} from "../../shared/validators";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 18 } },
  exit: { opacity: 0, scale: 0.85, y: 30, transition: { duration: 0.15 } }
};

export const UserMenu = React.memo(({ user: userProp, adminUpdate, onClose }) => {
  const outletContext = useOutletContext();
  const onUserUpdate = userProp?.onUserUpdate || outletContext?.onUserUpdate;
  const contextUser = outletContext?.user;
  const navigate = useNavigate();
  const { user: loggedUser, logout, setUserDetails } = useUserDetails();
  const { degrees, fetchDegrees } = useGetDegrees();

  const user = userProp || contextUser || loggedUser;

  useEffect(() => void fetchDegrees(), [fetchDegrees]);

  const degreeName = useMemo(() => {
    const found = degrees.find(d => d._id === user.degree);
    return found?.name || "";
  }, [degrees, user.degree]);

  const [profile, setProfile] = useState({ username: "", name: "", surname: "", email: "", role: user.role || "" });
  useEffect(() => {
    if (!user) return;
    setProfile({
      username: user.username || "",
      name: user.name || "",
      surname: user.surname || "",
      email: user.email || "",
      role: user.role || ""
    });
  }, [user]);

  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [show, setShow] = useState({ new: false, confirm: false });
  const fileInputRef = useRef(null);
  const isAdminEditing = Boolean(adminUpdate);

  const { update: updateProfile, isLoading: loadingUpdateProfile } = isAdminEditing ? adminUpdate : useUpdateProfile();
  const { update: updatePassword, isLoading: loadingUpdatePassword } = useUpdatePassword();
  const { update: updateProfilePicture, isLoading: loadingUpdatePhoto } = useUpdateProfilePicture();
  const { remove: deleteProfilePicture, isLoading: loadingDeletePhoto } = useDeleteProfilePicture();

  const handleClose = useCallback(() => {
    if (onClose) return onClose();
    window.history.length > 1 ? navigate(-1) : navigate("/kinal.library/inicio");
  }, [navigate, onClose]);

  const handleProfileChange = useCallback(field => e => {
    setProfile(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const handleSaveProfile = useCallback(async e => {
    e.preventDefault();
    if (!validateEmail(profile.email)) {
      alert(validateEmailMessage);
      return;
    }
    try {
      let result;
      if (isAdminEditing) {
        result = await updateProfile({ id: user.uid, ...profile });
      } else {
        await updateProfile({ id: user.uid, ...profile });
        result = { ...user, ...profile };
        setUserDetails(result);
      }
      onUserUpdate?.(result);
      handleClose();
    } catch (err) {
      toast.error(`Error al actualizar perfil: ${err.message}`);
    }
  }, [profile, updateProfile, user, isAdminEditing, setUserDetails, onUserUpdate, handleClose]);

  const handlePasswordChange = useCallback(field => e => {
    setPasswords(prev => ({ ...prev, [field]: e.target.value }));
  }, []);

  const toggleShow = useCallback(field => () => {
    setShow(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleSavePassword = useCallback(async e => {
    e.preventDefault();
    const { new: newPwd, confirm } = passwords;
    if (!validatePassword(newPwd)) {
      alert(validatePasswordMessage);
      return;
    }
    if (newPwd !== confirm) {
      alert("La nueva contraseña y la confirmación no coinciden");
      return;
    }
    try {
      await updatePassword({ newPassword: newPwd });
      toast.success("Contraseña actualizada");
      setPasswords({ new: "", confirm: "" });
      handleClose();
    } catch (err) {
      toast.error(`Error al actualizar contraseña: ${err.message}`);
    }
  }, [passwords, updatePassword, handleClose]);

  const handleEditPhotoClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("profilePicture", file);
      const res = await updateProfilePicture(fd);
      const pic = res?.data?.profilePicture;
      if (pic) {
        const updated = { ...user, profilePicture: pic };
        setUserDetails(updated);
        onUserUpdate?.(updated);
        toast.success("Foto actualizada");
        handleClose();
      }
    } catch {
      toast.error("Error al subir foto");
    } finally {
      e.target.value = null;
    }
  }, [updateProfilePicture, user, setUserDetails, onUserUpdate, handleClose]);

  const handleDeletePhoto = useCallback(async () => {
    if (!window.confirm("¿Eliminar foto de perfil?")) return;

    try {
      const data = await deleteProfilePicture();
      const newUrl = data.profilePicture;

      setUserDetails({ ...user, profilePicture: newUrl });
      onUserUpdate?.({ ...user, profilePicture: newUrl });
      toast.success("Foto de perfil restablecida");
    } catch (err) {
      toast.error("No se pudo eliminar la foto");
    }
  }, [deleteProfilePicture, user, setUserDetails, onUserUpdate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/kinal.library/acceso");
  }, [logout, navigate]);

  const buttonVariants = {
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
    transition: { type: "spring", stiffness: 400, damping: 10 },
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-40"
        onClick={handleClose}
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
          onClick={e => e.stopPropagation()}
        >
          <button onClick={handleClose} className="absolute top-3 left-3 text-gray-500 hover:text-gray-800">
            <XMarkIcon className="h-8 w-8" />
          </button>
          <h2 className="text-2xl font-bold text-center mb-6">Perfil de usuario</h2>

          <div className="flex flex-col items-center mb-6">
            <img
              src={`${user.profilePicture}?t=${Date.now()}`}
              alt="Perfil"
              className="w-32 h-32 rounded-full border-2 border-gray-300 mb-3 object-cover"
            />
            {!isAdminEditing && (
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                disabled={loadingUpdatePhoto}
              />
            )}
            {!isAdminEditing && (
              <div className="flex space-x-2">
                <motion.button
                  onClick={handleEditPhotoClick}
                  disabled={loadingUpdatePhoto}
                  variants={buttonVariants}
                  whileTap="whileTap"
                  whileHover="whileHover"
                  className="px-4 py-2 bg-[#1e3169] text-white font-medium rounded hover:bg-[#16254c] disabled:opacity-50"
                >
                  {loadingUpdatePhoto ? "Subiendo..." : "Editar foto"}
                </motion.button>
                <motion.button
                  onClick={handleDeletePhoto}
                  disabled={loadingDeletePhoto}
                  variants={buttonVariants}
                  whileTap="whileTap"
                  whileHover="whileHover"
                  className="px-4 py-2 text-white bg-[#b8001c] hover:bg-[#a70019] font-medium rounded disabled:opacity-50"
                >
                  {loadingDeletePhoto ? "Eliminando..." : "Eliminar foto"}
                </motion.button>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 mb-6">
            <div>
              <label className="block font-semibold mb-1">Nombre de usuario</label>
              <input
                type="text"
                value={profile.username}
                onChange={handleProfileChange("username")}
                className="w-full border px-3 py-2 rounded"
                disabled={loadingUpdateProfile}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Nombres</label>
              <input
                type="text"
                value={profile.name}
                onChange={handleProfileChange("name")}
                className="w-full border px-3 py-2 rounded"
                disabled={loadingUpdateProfile}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Apellidos</label>
              <input
                type="text"
                value={profile.surname}
                onChange={handleProfileChange("surname")}
                className="w-full border px-3 py-2 rounded"
                disabled={loadingUpdateProfile}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Correo electrónico</label>
              <input
                type="email"
                value={profile.email}
                onChange={handleProfileChange("email")}
                className="w-full border px-3 py-2 rounded"
                disabled={loadingUpdateProfile}
               	required
              />
            </div>
            {user.role === "STUDENT_ROLE" && (
              <div>
                <label className="block font-semibold mb-1">Grado</label>
                <input
                  type="text"
                  value={degreeName}
                  disabled
                  className="w-full border bg-gray-100 px-3 py-2 rounded cursor-not-allowed"
                />
              </div>
            )}
            <div>
              <label className="block font-semibold mb-1">Rol</label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full border bg-gray-100 px-3 py-2 rounded cursor-not-allowed"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loadingUpdateProfile}
              variants={buttonVariants}
              whileTap="whileTap"
              whileHover="whileHover"
              className="w-full bg-green-600 text-white hover:bg-green-700 font-medium py-2 rounded disabled:opacity-50"
            >
              {loadingUpdateProfile ? "Guardando..." : "Guardar datos"}
            </motion.button>
          </form>

          {!isAdminEditing && (
            <form onSubmit={handleSavePassword} className="space-y-4 mb-4">
              <h3 className="text-xl font-semibold text-center mb-4">Cambiar contraseña</h3>
              <div className="relative">
                <input
                  type={show.new ? "text" : "password"}
                  value={passwords.new}
                  onChange={handlePasswordChange("new")}
                  className="w-full border px-3 py-2 rounded pr-10"
                  placeholder="Ingresa tu nueva contraseña"
                  disabled={loadingUpdatePassword}
                  required
                />
                <button type="button" onClick={toggleShow("new")} className="absolute inset-y-0 right-2 flex items-center">
                  {show.new ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={show.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={handlePasswordChange("confirm")}
                  className="w-full border px-3 py-2 rounded pr-10"
                  placeholder="Confirma tu nueva contraseña"
                  disabled={loadingUpdatePassword}
                  required
                />
                <button type="button" onClick={toggleShow("confirm")} className="absolute inset-y-0 right-2 flex items-center">
                  {show.confirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              <motion.button
                type="submit"
                disabled={loadingUpdatePassword}
                variants={buttonVariants}
                whileTap="whileTap"
                whileHover="whileHover"
                className="w-full bg-[#1e3169] text-white font-medium rounded hover:bg-[#16254c] py-2 disabled:opacity-50"
              >
                {loadingUpdatePassword ? "Actualizando..." : "Cambiar contraseña"}
              </motion.button>
            </form>
          )}

          {!isAdminEditing && (
            <motion.button 
              variants={buttonVariants}
              whileTap="whileTap"
              whileHover="whileHover"
              onClick={handleLogout} 
              className="w-full bg-[#1e3169] text-white font-medium rounded hover:bg-[#16254c] py-2">
              Cerrar sesión
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

UserMenu.propTypes = {
  user: PropTypes.object,
  adminUpdate: PropTypes.object,
  onClose: PropTypes.func
};
