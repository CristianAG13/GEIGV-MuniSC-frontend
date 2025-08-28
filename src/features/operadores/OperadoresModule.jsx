import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OperatorsIndex from './components/OperatorsIndex';

/**
 * Módulo de gestión de operadores
 */
const OperatorsModule = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<OperatorsIndex />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default OperatorsModule;
