// Componente temporal para capturar objetos que se intentan renderizar
import React from 'react';

const SafeRender = ({ children }) => {
  if (typeof children === 'object' && children !== null && !React.isValidElement(children)) {
    console.error('⚠️ OBJETO DETECTADO:', children);
    console.trace('Stack trace del objeto problemático');
    
    // Si tiene las propiedades problemáticas, las convertimos
    if (children.roleName !== undefined || children.count !== undefined || children.percentage !== undefined) {
      console.error('🔴 OBJETO CON PROPIEDADES PROBLEMÁTICAS:', {
        roleName: children.roleName,
        count: children.count,
        percentage: children.percentage
      });
      
      // Convertir el objeto a string para mostrarlo
      return JSON.stringify(children);
    }
    
    return JSON.stringify(children);
  }
  
  return children;
};

export default SafeRender;