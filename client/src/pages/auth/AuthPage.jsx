import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Login } from "../../components/auth/Login";
import { Register } from "../../components/auth/Register";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <motion.div
      style={{ backgroundSize: "200% 200%" }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#bcddff] to-[#ffffff]"
      initial={{ backgroundPosition: "0% 50%" }}
      animate={{ backgroundPosition: "100% 50%" }}
      transition={{
        duration: 8,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      <AnimatePresence mode="wait">
        {isLogin ? (
          <Login
            key="login"
            switchAuthHandler={() => setIsLogin(false)}
          />
        ) : (
          <Register
            key="register"
            switchAuthHandler={() => setIsLogin(true)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
