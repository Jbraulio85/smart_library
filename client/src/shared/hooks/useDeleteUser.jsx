import { useState } from "react";
import { deleteUser } from "../../services/api";
import toast from "react-hot-toast";

export const useDeleteUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (password) => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await deleteUser(password);
    if (response.error) {
      toast.error("Error eliminando usuario");
      setError(response.error);
      return null;
    }
    toast.success("Usuario eliminado");
    return response.data;
  } catch (err) {
    toast.error("Error inesperado eliminando usuario");
    setError(err);
    return null;
  } finally {
    setIsLoading(false);
  }
};


  return { remove, isLoading, error };
};
