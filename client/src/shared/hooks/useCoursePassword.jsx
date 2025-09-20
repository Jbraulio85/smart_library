import { useState } from "react";
import { getCoursePassword } from "../../services/api";

export const useCoursePassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState(null);
  const [error, setError] = useState(null);

  const fetchCoursePassword = async (cid) => {
    setLoading(true);
    setError(null);

    try {
      const res = await getCoursePassword(cid);

      if (res?.data?.success) {
        setPassword(res.data.password);
      } else {
        setError(res?.data?.message || "Solo el creador del curso puede ver la contraseña.");
      }
    } catch (err) {
      setError("Error al obtener la contraseña del curso");
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    loading,
    error,
    fetchCoursePassword,
  };
};
