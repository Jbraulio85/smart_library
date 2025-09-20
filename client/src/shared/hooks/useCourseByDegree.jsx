import { useEffect, useState } from "react";
import { getMyCoursesById } from "../../services/api";

export const useCourseByDegree = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const response = await getMyCoursesById();

      if (response.error) {
        setError("Error al obtener los cursos por grado");
      } else {
        setCourses(response.data.course || []);
      }

      setLoading(false);
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
};
