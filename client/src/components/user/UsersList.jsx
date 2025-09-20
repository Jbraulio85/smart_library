import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUsers } from "../../shared/hooks/useUsers.jsx";
import { useDeleteUserAccount } from "../../shared/hooks/useDeleteUserAccount.jsx";
import { Spinner } from "../Spinner.jsx";

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } },
};
const rowVariants = {
  initial:    { opacity: 0, x: -20 },
  animate:    { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit:       { opacity: 0, x: 20, transition: { duration: 0.2 } },
  whileHover: { scale: 1.01, transition: { duration: 0.2 } },
};
const deleteButtonVariants = {
  whileTap:   { scale: 0.95 },
  whileHover: { scale: 1.02 },
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

export const UsersList = () => {
  const { users, total, loading, error, refetch } = useUsers({ limit: 10, offset: 0 });
  const { deleteUser, loading: deleting } = useDeleteUserAccount();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (loading) {
      setShowSpinner(true);
    } else {
      const t = setTimeout(() => setShowSpinner(false), 1000);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const handleDelete = async (uid) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
    const result = await deleteUser(uid);
    if (result?.success) {
      alert("Usuario eliminado exitosamente");
      refetch();
    } else {
      alert("Error al eliminar el usuario");
    }
  };

  if (showSpinner) {
    return <Spinner />;
  }
  if (error) {
    return <p className="text-center text-red-500 mt-10">Error: {error}</p>;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="max-w-6xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.p
          className="text-gray-600 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.4 } }}
        >
          Total de usuarios: <span className="font-semibold">{total}</span>
        </motion.p>

        <div
          className="overflow-x-auto rounded-lg shadow no-scrollbar"
        >
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Estado","Foto","Usuario","Nombres","Apellidos",
                  "Correo electrónico","Teléfono","Rol","Acción"
                ].map((th) => (
                  <th
                    key={th}
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {users.map((user) => (
                  <motion.tr
                    key={user.uid}
                    variants={rowVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    whileHover="whileHover"
                    className="hover:bg-gray-50"
                    layout
                  >
                    <td className="px-6 py-4 text-sm">
                      {user.status ? (
                        <span className="px-2 py-1.5 bg-green-100 text-green-800 rounded text-xs">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1.5 bg-red-100 text-red-800 rounded text-xs">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={user.profilePicture}
                        alt="Foto de perfil"
                        className="w-14 aspect-square rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {user.surname}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <motion.button
                        onClick={() => handleDelete(user.uid)}
                        disabled={deleting}
                        variants={deleteButtonVariants}
                        whileTap="whileTap"
                        whileHover="whileHover"
                        className="text-red-700 bg-red-100 hover:bg-red-200 px-3 py-2 rounded text-sm transition"
                      >
                        {deleting ? "Eliminando..." : "Eliminar"}
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
