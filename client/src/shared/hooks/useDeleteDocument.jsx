import { useState, useCallback } from "react";
import { deleteDocumentFromCourse } from "../../services/api";

export function useDeleteDocument(cid) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const deleteDoc = useCallback(
    async (did) => {
      setIsLoading(true);
      setError(null);

      const resp = await deleteDocumentFromCourse(cid, did);

      if (resp.error || resp.data?.success === false) {
        const msg = resp.data?.message || resp.e?.message || "Error al eliminar";
        setError(msg);
      }

      setIsLoading(false);
      return resp;
    },
    [cid]
  );

  return { deleteDoc, isLoading, error };
}
