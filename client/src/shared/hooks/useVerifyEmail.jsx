
import { useState, useCallback } from "react";
import { verifyEmail as apiVerifyEmail } from "../../services/api";

export const useVerifyEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const verify = useCallback(async (code) => {
    setIsLoading(true);
    setError(null);

    const response = await apiVerifyEmail(code);

    setIsLoading(false);

    if (response.error) {
      setError(response.e);
      return false;
    }

    return true;
  }, []);

  return { verify, isLoading, error };
};
