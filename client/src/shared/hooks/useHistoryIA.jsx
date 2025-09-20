import { useState, useEffect, useCallback } from "react";
import { historyIA } from "../../services/api";

export const useHistoryIA = (pdfUrl) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState("");

  const fetchHistory = useCallback(async () => {
    if (!pdfUrl) return;

    setLoadingHistory(true);
    setErrorHistory("");

    try {
      const res = await historyIA({ url: pdfUrl });
      if (res.success) {
        setHistory(res.history);
      } else {
        setErrorHistory(res.message || "Error al recuperar historial");
      }
    } catch {
      setErrorHistory("Error al recuperar historial");
    } finally {
      setLoadingHistory(false);
    }
  }, [pdfUrl]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loadingHistory,
    errorHistory,
    refetchHistory: fetchHistory,
  };
};
