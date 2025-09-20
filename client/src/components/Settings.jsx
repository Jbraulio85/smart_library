import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog8ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';

const overlayVariants = {
  hidden:   { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } }
};
const modalVariants = {
  hidden:   { opacity: 0, scale: 0.85, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 18 } },
  exit:    { opacity: 0, scale: 0.85, y: 30, transition: { duration: 0.15 } }
};

export const Settings = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 z-40"
        onClick={handleClose}
        style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.25)' }}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 px-4 overflow-auto"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div
          className="relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 left-3 text-gray-500 hover:text-gray-800"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Title */}
          <div className="flex items-center mb-6 justify-center">
            <Cog8ToothIcon className="h-8 w-8 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Ajustes</h1>
          </div>

          {/* Options */}
          <section className="space-y-4">
            {/* Notifications (logic pending) */}
            <div className="flex items-center space-x-2">
              <input
                id="notifications"
                type="checkbox"
                disabled
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="text-gray-700">
                Habilitar notificaciones
              </label>
            </div>
          </section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
