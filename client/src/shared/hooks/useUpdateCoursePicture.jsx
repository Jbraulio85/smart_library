import { useState } from "react";
import { updateCoursePicture } from "../../services/api";
import toast from "react-hot-toast";

export const useUpdateProfilePicture = () => {
  const [isLoading, setIsLoading] = useState(false);

  const coursePictureUpdate = async (cid, formData) => {
    setIsLoading(true);
    try {
      const response = await updateCoursePicture(cid, formData);
      if (response.error) {
        console.error("Error en updateCoursePicture:", response.e);
        toast.error("Error actualizando foto de perfil");
        return null;
      }
      toast.success("Foto de perfil actualizada");
      return response;
    } catch (error) {
      console.error("Excepción inesperada al actualizar foto:", error);
      toast.error("Error inesperado actualizando foto");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { coursePictureUpdate, isLoading };
};
