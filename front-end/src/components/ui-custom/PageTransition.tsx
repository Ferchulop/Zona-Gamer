/**
 * 
 * 
 * Componente que añade animaciones de transición suaves
 * cuando se navega entre páginas de la aplicación. Utiliza Framer Motion
 * para crear efectos de entrada y salida
 * 
 * Las animaciones incluyen:
 * - Fade in/out (opacidad)
 * - Movimiento vertical suave
 * 
 */

import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
