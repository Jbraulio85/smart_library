import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getCourses } from "../../services/api";

export const useGetCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCourses();
      if (response.error) {
        const err = response.e;
        const msg = err.response?.data?.msg || err.message;
        toast.error(msg);
        return;
      }

      setCourses(response.data.courses);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { courses, fetchCourses, isLoading };
};