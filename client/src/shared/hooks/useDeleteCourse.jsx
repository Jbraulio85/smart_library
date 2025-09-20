import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { deleteCourse } from "../../services/api";

export const useDeleteCourses = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchDeleteCourse = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const response = await deleteCourse(id);
      if (response.error) {
        const err = response.e;
        const msg = err.response?.data?.msg || err.message;
        toast.error(msg);
        return { error: true, message: msg };
      }
      toast.success(response.data.msg || "Curso eliminado");
      return { data: response.data };
    } catch (err) {
      toast.error(err.message);
      return { error: true, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchDeleteCourse, isLoading };
};