import { useState, useCallback } from "react";
import { getDocumentsByBimester } from "../../services/api";

export const useDocumentsByBimester = (cid) => {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [errorDocs, setErrorDocs] = useState(null);

  const fetchDocuments = useCallback(async (bimesterData) => {
    setLoadingDocs(true);
    setErrorDocs(null);
    try {
      const res = await getDocumentsByBimester(cid, bimesterData);
      if (!res.error) {
        setDocuments(res.data.documents || []);
      } else {
        const errorMessage = res.e?.response?.data?.message || res.e?.message || "Error al obtener documentos";
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Error al cargar documentos:", err);
      setErrorDocs(err.message || "No se pudieron cargar los documentos");
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [cid]);

  return { documents, setDocuments, fetchDocuments, loadingDocs, errorDocs };
};