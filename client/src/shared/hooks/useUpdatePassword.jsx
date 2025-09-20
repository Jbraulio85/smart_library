import { useState } from "react";
import { updatePassword } from "../../services/api";
import toast from "react-hot-toast";

export const useUpdatePassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const update = async ({ newPassword }) => {
    setIsLoading(true);
    try {
      const response = await updatePassword({ newPassword });
      if (response.error) {
        toast.error("Error cambiando contraseña");
        return;
      }
      toast.success("Contraseña cambiada correctamente");
      return response.data;
    } catch (error) {
      toast.error("Error inesperado al cambiar contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return { update, isLoading };
};
