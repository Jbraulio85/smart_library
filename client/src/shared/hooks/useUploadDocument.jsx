import { useState } from "react";
import { uploadDocumentToCourse } from "../../services/api";

export const useUploadDocument = () => {
  const [loading, setLoading] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const uploadDocument = async (cid, file, bimester) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setUploadedDocument(null);

    if (!file) {
      setError("Debes seleccionar un archivo.");
      setLoading(false);
      return;
    }

    if (!bimester) {
      setError("Debes seleccionar un bimestre.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("bimester", bimester);

    try {
      const res = await uploadDocumentToCourse(cid, formData);

      if (res?.data?.success) {
        setUploadedDocument(res.data.document);
        setSuccess("Documento subido correctamente");
      } else {
        setError(res?.data?.message || "Error al subir el documento");
      }
    } catch (err) {
      setError("Error al subir el documento");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    uploadedDocument,
    error,
    success,
    uploadDocument,
  };
};
