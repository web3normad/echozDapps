// src/contexts/WalletContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { connect, disconnect } from 'get-starknet';
import { Contract } from 'starknet';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Function to create contract instance
  const getContract = (contractAddress, abi) => {
    if (!account) return null;
    
    const contract = new Contract(abi, contractAddress, account);
    return contract;
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const starknet = await connect({
        modalTheme: 'dark',
        modalMode: 'alwaysAsk', // This ensures user can choose which wallet to connect
      });

      if (!starknet) {
        throw new Error('Please install a Starknet wallet');
      }

      const userWallet = starknet.account;
      if (!userWallet) {
        throw new Error('No wallet found');
      }

      setWallet(starknet);
      setAccount(userWallet);
      setAddress(starknet.selectedAddress);

      // Listen for wallet changes
      starknet.on('accountsChanged', (accounts) => {
        setAddress(accounts[0]);
      });

      return starknet;
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      setWallet(null);
      setAccount(null);
      setAddress(null);
    } catch (err) {
      console.error('Wallet disconnection error:', err);
      setError(err.message);
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const starknet = await connect({
          modalMode: 'neverAsk',
        });
        
        if (starknet && starknet.isConnected) {
          setWallet(starknet);
          setAccount(starknet.account);
          setAddress(starknet.selectedAddress);
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkConnection();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        account,
        address,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        getContract,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};