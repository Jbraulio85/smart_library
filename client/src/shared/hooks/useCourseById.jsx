import { useEffect, useState } from "react";
import { getCourseById } from "../../services/api";

export const useCourseById = (cid) => {
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = async () => {
    setIsLoading(true);
    setError(null);

    const response = await getCourseById(cid);

    if (response.error) {
      setError("Error al obtener el curso");
    } else {
      setCourse(response.course);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (cid) fetchCourse();
  }, [cid]);

  return {
    course,
    isLoading,
    error,
    refetch: fetchCourse,
  };
};
