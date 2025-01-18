import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Header';
import StarknetProvider from './starknet-provider';

const DashboardLayout = ({ children }) => {
  return (
    <StarknetProvider>
    <div className="flex dark:bg-[#131316] bg-[#fafafa]">
      <Sidebar />
      <div className="w-full dark:bg-[#131316] z-10">
        <Navbar />
        <main className="p-4 bg-gray-50 dark:bg-[#0F0F0F] overflow-y-hidden">
          {children}
        </main>
      </div>
    </div>
    </StarknetProvider>
  );
};

export default DashboardLayout;
