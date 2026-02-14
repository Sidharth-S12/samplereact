import React from 'react';
import { Navbar } from './Navbar';

export const Layout = ({ children }) => {
  return (
    <div className="bg-gradient-to-br from-[#0F172A] via-[#020617] to-[#020617] text-gray-200 min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};
