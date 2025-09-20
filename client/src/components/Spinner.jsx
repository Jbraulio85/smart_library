import React from "react";
import { motion } from "framer-motion";

export const Spinner = () => (
  <div className="flex justify-center items-center py-6">
    <motion.div
      className="w-10 h-10 border-4 border-t-4 border-gray-300 border-t-[#1e3169] rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
    />
  </div>
);
