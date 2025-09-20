import { useEffect, useState } from "react";
import { getCoursesByTeacher } from "../../services/api";

export const useMyTeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const response = await getCoursesByTeacher();

      if (response.error) {
        setError("No se pudieron obtener los cursos del profesor.");
      } else {
        setCourses(response.data.courses);
      }

      setLoading(false);
    };

    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
  };
};
