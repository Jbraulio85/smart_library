import { useState } from "react";
import { updateCoursePassword } from "../../services/api";
import toast from "react-hot-toast";

export const useUpdateCoursePassword = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updatePassword = async ({ cid, newPassword }) => {
    setIsLoading(true);
    try {
      const data = { newPassword };
      const response = await updateCoursePassword(cid, data);
      
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

  return { updatePassword, isLoading };
};
