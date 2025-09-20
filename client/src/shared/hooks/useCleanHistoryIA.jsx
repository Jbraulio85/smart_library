import { useState, useCallback } from "react";
import { cleanHistoryIA } from "../../services/api";

export const useCleanHistoryIA = (pdfUrl) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const clearHistory = useCallback(async () => {
    if (!pdfUrl) {
      setError("Falta la URL del documento");
      return false;
    }
    setLoading(true);
    setError("");
    try {
      const res = await cleanHistoryIA({ url: pdfUrl });
      if (!res.success) {
        setError(res.message || "No se pudo eliminar el historial");
        return false;
      }
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pdfUrl]);

  return { clearHistory, loading, error };
};

