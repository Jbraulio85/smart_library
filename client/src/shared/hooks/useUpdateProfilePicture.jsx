import { useState } from "react";
import { updateProfilePicture } from "../../services/api";
import toast from "react-hot-toast";

export const useUpdateProfilePicture = () => {
  const [isLoading, setIsLoading] = useState(false);

  const update = async (formData) => {
    setIsLoading(true);
    try {
      const response = await updateProfilePicture(formData);
      if (response.error) {
        toast.error("Error actualizando foto de perfil");
        return;
      }
      toast.success("Foto de perfil actualizada");
      return response;
    } catch (error) {
      toast.error("Error inesperado actualizando foto");
    } finally {
      setIsLoading(false);
    }
  };

  return { update, isLoading };
};
