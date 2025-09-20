import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getTrivia } from "../../services";

export const useGetTrivia = () => {
  const [trivia, setTrivia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrivia = useCallback(async (id) => {
    console.log("Fetching trivia with ID:", id);
    try {
      const response = await getTrivia(id);
      if (response.error) {
        const err = response.e;
        const msg = err.response?.data?.msg || err.message;
        toast.error(msg);
        return;
      }
        setIsLoading(true);
        setTrivia(response.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { trivia, fetchTrivia, isLoading };
};