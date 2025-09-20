import { useState } from "react";
import { assignCourse } from "../../services/api";
import toast from "react-hot-toast";

export const useAssignCourse = () => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const assign = async (cid, data) => {
    setLoading(true);
    setSuccessMessage("");

    const response = await assignCourse(cid, data);

    if (response.error || response?.data?.success === false) {
      const errorMessage =
        response?.e?.response?.data?.message ||
        response?.data?.message ||
        "Ocurrió un error al intentar inscribirse";
      setError(errorMessage);
    } else {
      setSuccessMessage("Inscripción exitosa al curso");
      setError("");
      toast.success("Asignación exitosa al curso");
    }

    setLoading(false);
    return response;
  };

  return {
    assign,
    loading,
    successMessage,
    error,
  };
};