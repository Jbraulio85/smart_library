import { useState, useCallback } from "react";
import { filterCoursesStudent } from "../../services/api";

export const useFilterCoursesStudent = () => {
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFilteredCourses = useCallback(
    async (filters) => {
      setLoading(true);
      setError(null);
      try {
        const response = await filterCoursesStudent(filters);
        if (response.error) throw new Error("Error al obtener los cursos");
        setFilteredCourses(response.data.courses || []);
      } catch (err) {
        setError(err.message);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    filteredCourses,
    fetchFilteredCourses,
    loading,
    error,
  };
};
