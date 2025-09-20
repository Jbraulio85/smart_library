import { useState, useEffect } from "react";

export const getUserDetails = () => {
  const ud = localStorage.getItem("user");
  return ud ? JSON.parse(ud) : null;
};

export const useUserDetails = () => {
  const [user, setUser] = useState(getUserDetails());

  useEffect(() => {
    setUser(getUserDetails());
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const setUserDetails = (newDetails) => {
    localStorage.setItem("user", JSON.stringify(newDetails)); 
    setUser(newDetails);
  };

  return {
    user,
    isLogged: Boolean(user),
    logout,
    setUserDetails
  };
};