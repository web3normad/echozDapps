import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Header';
import { useWallet } from '../context/WalletContext';

const DashboardLayout = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Access wallet context values
  const { address, connectWallet, disconnectWallet } = useWallet();

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Effect to apply dark mode classes to the body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`flex ${isDarkMode ? 'dark:bg-dark-primary-200' : 'bg-light-primary-500'}`}>
      <Sidebar />
      <div className="w-full z-10">
        <Navbar
          address={address}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          toggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
        />
        <main className={`p-4 ${isDarkMode ? 'bg-dark-primary-200' : 'bg-light-primary-200'} overflow-y-hidden`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
