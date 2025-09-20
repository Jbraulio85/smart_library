import { useEffect, useState } from "react";
import { getMyCourses } from "../../services/api";

export const useMyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      const response = await getMyCourses();

      if (response.error) {
        setError(response.e?.message || "Error al obtener los cursos");
      } else {
        setCourses(response.data?.courses || []);
      }

      setLoading(false);
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
};
