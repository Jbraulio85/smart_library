import { useState } from "react";
import { deleteProfilePicture } from "../../services/api";
import toast from "react-hot-toast";

export const useDeleteProfilePicture = () => {
  const [isLoading, setIsLoading] = useState(false);

  const remove = async () => {
    setIsLoading(true);
    try {
      const response = await deleteProfilePicture();
      if (response.error) {
        toast.error("Error eliminando foto de perfil");
        return;
      }
      toast.success("Foto de perfil eliminada");
      return response.data;
    } catch (error) {
      toast.error("Error inesperado eliminando foto");
    } finally {
      setIsLoading(false);
    }
  };

  return { remove, isLoading };
};
