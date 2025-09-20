import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { Navbar } from "../navs/Navbar";
import { useUserDetails } from "../../shared/hooks/useUserDetails.jsx";

const SECTIONS = {
  profile: "/kinal.library/perfil",
  users: "/kinal.library/usuarios",
  settings: "/kinal.library/ajustes",
  courses: "/kinal.library/cursos",
  courseStudent: "/kinal.library/cursos/estudiante",
  courseTeacher: "/kinal.library/cursos/maestro",
  allCourses: "/kinal.library/cursos/grados"
};

export function Content() {
  const { user: userFromContext, isLogged, setUserDetails } = useUserDetails();
  const [user, setUser] = useState(userFromContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUser(userFromContext);
  }, [userFromContext]);

  useEffect(() => {
    if (!isLogged) {
      navigate("/");
    }
  }, [isLogged, navigate]);

  if (!isLogged) {
    return null;
  }

  const getActiveSection = () => {
    const currentPath = location.pathname;

    if (
      user.role === "TEACHER_ROLE" &&
      /^\/kinal\.library\/cursos\/[^/]+\/documentos/.test(currentPath)
    ) {
      return "courseTeacher";
    }

    if (
      user.role === "STUDENT_ROLE" &&
      /^\/kinal\.library\/cursos\/[^/]+\/documentos/.test(currentPath)
    ) {
      return "courseStudent";
    }

    const keys = Object.keys(SECTIONS).sort(
      (a, b) => SECTIONS[b].length - SECTIONS[a].length
    );

    for (const key of keys) {
      if (currentPath.startsWith(SECTIONS[key])) {
        return key;
      }
    }
    return "";
  };

  const activeSection = getActiveSection();

  const handleSelectSection = (key) => {
    const destination = SECTIONS[key];
    if (destination) {
      navigate(destination);
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.16 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-white"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Navbar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        user={user}
      />
      <div className="content-container">
        <Outlet context={{ onUserUpdate: setUserDetails, user }} />
      </div>
    </motion.div>
  );
}
