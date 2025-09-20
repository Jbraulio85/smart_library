import { useState } from "react";
import { login as loginRequest } from "../../services/api";
import toast from "react-hot-toast";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (identifier, password) => {
    setIsLoading(true);
    let loginSuccessful = false;
    try {
      const payload = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };

      const response = await loginRequest(payload);
      if (response.error) {
        const errBody = response.e.response?.data || "Error al iniciar sesión";
        toast.error(
          typeof errBody === "string"
            ? errBody
            : errBody.error || errBody.message || JSON.stringify(errBody)
        );
      } else {
        const { userDetails } = response.data;
        localStorage.setItem("user", JSON.stringify(userDetails));
        loginSuccessful = true;
      }
    } catch (err) {
      console.error("Error inesperado al iniciar sesión:", err);
      const errBody = err.response?.data || err.message;
      toast.error(typeof errBody === "string" ? errBody : JSON.stringify(errBody));
    } finally {
      setIsLoading(false);
    }
    return loginSuccessful;
  };

  return { login, isLoading };
};
