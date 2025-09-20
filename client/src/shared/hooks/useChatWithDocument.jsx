import { useState, useCallback } from "react";
import { consultDocumentIA } from "../../services/api";

export const useChatWithDocument = (pdfUrl) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [history, setHistory] = useState([]);

  const askDocument = useCallback(async ({ question }) => {
    if (!pdfUrl) {
      setError("Falta la URL del documento");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await consultDocumentIA({ url: pdfUrl, question });
      if (res.success) {
        setHistory(prev => [...prev, { question, answer: res.answer, createdAt: Date.now() }]);
      } else {
        setError(res.message || "No se pudo obtener respuesta de la IA.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [pdfUrl]);

  const resetAnswer = useCallback(() => {
    setHistory([]);
  }, []);

  return { askDocument, loading, error, history, resetAnswer };
};
