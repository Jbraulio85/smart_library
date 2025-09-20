import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { answerTrivia } from "../../services";

export const useCheckAnswer = () => {
  const [response, setResponse] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const answer = useCallback(async (triviaId, data) => {
    setIsLoading(true);
    try {
      const response = await answerTrivia(triviaId, data);
      if (response.error) {
        const err = response.e;
        const msg = err.response?.data?.msg || err.message;
        toast.error(msg);
        return { error: true, message: msg };
      }
      console.log(response.data.msg || "Respuesta enviada correctamente");
      setResponse(response.data);
    } catch (err) {
      console.error(err.message);
      return { error: true, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { answer, response, isLoading };
};