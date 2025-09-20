import { useState } from "react";
import { deleteUserAccount } from "../../services/api";

export const useDeleteUserAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteUser = async (uid) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteUserAccount(uid);
      if (response.error) throw new Error("Error al eliminar el usuario");
      return response.data;
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteUser,
    loading,
    error,
  };
};
