import { useState } from "react";
import { updateCourse } from "../../services/api";
import toast from "react-hot-toast";

export const useUpdateCourse = () => {
  const [isLoading, setIsLoading] = useState(false);

  const courseUpdate = async ({ cid, fieldsToUpdate}) => {
    setIsLoading(true);
    try {
      const payload = {};
      Object.entries(fieldsToUpdate).forEach(([key, val]) => {
        if (val !== undefined) payload[key] = val;
      });
      const response = await updateCourse(cid, payload);
      
      if (response.error) {
        toast.error("Error actualizando curso");
        return;
      }
      toast.success("Curso actualizado correctamente");
      return response.data;
    } catch (error) {
      toast.error("Error inesperado al actualizar curso");
    } finally {
      setIsLoading(false);
    }
  };

  return { courseUpdate, isLoading };
};
