import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { addCourse } from "../../services/api";

export const useAddCourses = () => {
  const [isLoading, setIsLoading] = useState(false);

  const addCourseHandler = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const response = await addCourse(formData);
      
      toast.success(response.data.message || 'Curso registrado');
      return { data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error inesperado';
      toast.error(msg);
      return { error: true, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { addCourse: addCourseHandler, isLoading };
};

 