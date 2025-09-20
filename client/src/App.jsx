import React from 'react'
import { useRoutes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from './routes.jsx'

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export const App = () => {
  let element = useRoutes(routes)
  return (
    <> 
      <ScrollToTop />
      {element}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />
    </>
  )
}