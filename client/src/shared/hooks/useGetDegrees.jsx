import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getDegrees } from "../../services/api";

export const useGetDegrees = () => {
  const [degrees, setDegrees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDegrees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getDegrees();
      if (response.error) {
        const err = response.e;
        const msg = err.response?.data?.message || err.message;
        toast.error(msg);
        return;
      }
      setDegrees(response.data.degrees);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    degrees,
    isLoading,
    fetchDegrees,
    refetch: fetchDegrees,
  };
};
