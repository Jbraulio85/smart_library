import { useEffect, useState } from "react";
import { getCourseId } from "../../services/api";

export const useCourseId = (cid) => {
  const [course, setCourse] = useState(null);
  const [degree, setDegree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getCourseId(cid);
        if (res?.data?.success && res?.data?.course) {
          setCourse(res.data.course);
          setDegree(res.data.course.degree?.name || null);
        } else {
          setError("Curso no encontrado");
        }
      } catch (err) {
        setError("Error al obtener el curso");
      } finally {
        setLoading(false);
      }
    };

    if (cid) fetchCourse();
  }, [cid]);

  return {
    course,
    degree,
    loading,
    error,
  };
};
