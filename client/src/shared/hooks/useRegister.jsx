import { useState, useCallback } from "react";
import { register as registerRequest } from "../../services/api";
import toast from "react-hot-toast";

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);

  const register = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const response = await registerRequest(formData);

      if (!response.error) {
        toast.success(response.data?.message || "¡Registrado correctamente!");
        return { success: true };
      } else {
        const errorData = response.e?.response?.data;
        if (errorData?.errors?.length > 0) {
          toast.error(errorData.errors[0].msg);
        } else if (errorData?.error) {
          toast.error(errorData.error);
        } else if (errorData?.message) {
          toast.error(errorData.message);
        } else {
          toast.error("Error al registrar la cuenta");
        }
        return { success: false };
      }
    } catch (error) {
      console.error("Error durante el registro:", error);
      toast.error("Ocurrió un error inesperado durante el registro.");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    register,
    isLoading,
  };
};