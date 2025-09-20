import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from "framer-motion";
import {
  Cog8ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const MENU = [
  { key: 'users',        label: 'Usuarios',           roles: ["ADMIN_ROLE"] },
  { key: 'courseStudent',label: 'Tus Cursos',         roles: ["STUDENT_ROLE"] },
  { key: 'courseTeacher',label: 'Mis cursos',         roles: ["TEACHER_ROLE"] },
  { key: 'courses',      label: 'Cursos',             roles: ["ADMIN_ROLE"] },
  { key: 'allCourses',   label: 'Cursos disponibles', roles: ["STUDENT_ROLE"] }
];

export const Navbar = ({ activeSection, onSelectSection, user }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const role = user.role;

  // anima la llegada del nav
  const navbarVariants = {
    hidden:  { opacity: 0, y: -18 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 150, damping: 14, delay: 0.08 } }
  };

  // anima el drawer
  const miniMenuVariants = {
    hidden:  { opacity: 0, y:  50 },
    visible: { opacity: 1, y:   0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit:    { opacity: 0, y:  50, transition: { duration: 0.2 } }
  };

  const src1x = user.profilePicture;
  const src2x = user.profilePicture2x || user.profilePicture;

  const filteredMenu = MENU.filter(item => item.roles.includes(role));

  return (
    <>
      <motion.nav
        className="bg-white px-6 py-3 flex items-center justify-between"
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <img
          src="https://siemprehaciaadelanteguate.com/wp-content/uploads/2025/03/fundacion-kinal-logo.webp"
          alt="Logo Kinal"
          className="w-30 sm:w-40 cursor-pointer"
          onClick={() => onSelectSection('home')}
        />

        {/* Menú en desktop */}
        <div className="hidden md:flex space-x-4 text-lg">
          {filteredMenu.map(item => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectSection(item.key)}
                className={`px-5 py-3 rounded-3xl transition ${
                  isActive
                    ? 'bg-[#1e3169] text-white font-semibold'
                    : 'text-[#1e3169] font-semibold hover:bg-gray-200 hover:scale-105'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Iconos de ajustes y perfil (siempre visibles) */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onSelectSection('profile')}
            aria-label="Perfil"
            className="relative"
          >
            <img
              src={src1x}
              srcSet={`${src1x} 1x, ${src2x} 2x`}
              alt="Perfil"
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full ring-2 ring-[#1e3169] object-cover shadow-lg transition-transform hover:scale-105"
            />
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
          </button>
        </div>
      </motion.nav>

      <button
        className="
          fixed bottom-4 left-4 z-40
          p-3 bg-[#1e3169] rounded-full shadow-lg
          md:hidden hover:bg-gray-100 transition
        "
        onClick={() => setDrawerOpen(prev => !prev)}
        aria-label="Abrir menú"
      >
        <Bars3Icon className="h-6 w-6 text-white" />
      </button>

      <AnimatePresence>
      {drawerOpen && (
        <motion.div
          className="
              fixed bottom-16 left-4 z-50
              w-48 bg-white rounded-lg shadow-xl
              overflow-hidden
              mb-2
            "
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={miniMenuVariants}
        >
          {/* Opciones de navegación */}
          <nav className="flex flex-col divide-y">
            {filteredMenu.map(item => {
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onSelectSection(item.key);
                    setDrawerOpen(false);
                  }}
                  className={`
                    text-left px-4 py-3 transition
                    ${isActive
                      ? 'bg-[#1e3169] text-white'
                      : 'text-[#1e3169] hover:bg-gray-100'}
                  `}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

Navbar.propTypes = {
  activeSection:   PropTypes.string.isRequired,
  onSelectSection: PropTypes.func.isRequired,
  user:            PropTypes.shape({
    role:             PropTypes.string.isRequired,
    profilePicture:   PropTypes.string.isRequired,
    profilePicture2x: PropTypes.string,
  }).isRequired,
};
