import { useState } from "react";
import { updateProfile } from "../../services/api";
import toast from "react-hot-toast";

export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const update = async ({ username, name, surname, email }) => {
    setIsLoading(true);
    try {
      const response = await updateProfile({ username, name, surname, email });
      if (response.error) {
        toast.error("Error actualizando perfil");
        return;
      }
      toast.success("Perfil actualizado correctamente");
      return response.data;
    } catch (error) {
      toast.error("Error inesperado al actualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return { update, isLoading };
};
