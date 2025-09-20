import React from 'react';

import { useDeleteCourses } from '../../shared/hooks/useDeleteCourse.jsx';

export const CourseDeletePage = ({ id, onDeleted }) => {
  const { fetchDeleteCourse, isLoading } = useDeleteCourses(); 

  const handleDelete = async () => {
    if (window.confirm('¿Confirma eliminación de curso?')) {
      await fetchDeleteCourse(id); 
      onDeleted();
    }
  };

  return (
    <>
      <button 
        onClick={handleDelete}
        disabled={isLoading}
        className="mt-4 w-full text-lg text-white bg-[#b8001c] hover:bg-[#a70019] disabled:opacity-50 font-medium py-2 px-4 rounded-lg transition"
      >
        Eliminar
      </button>
    </>
  );
};