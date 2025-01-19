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
        modalMode: 'alwaysAsk',
        walletOptions: {
          order: ['argentX', 'braavos']
        }
      });

      if (!starknet) {
        throw new Error('Please install a Starknet wallet');
      }

      // Get the account differently based on the wallet type
      const userAccount = starknet.account || starknet;
      if (!userAccount) {
        throw new Error('No wallet found');
      }

      setWallet(starknet);
      setAccount(userAccount);
      setAddress(starknet.selectedAddress);

      // Listen for wallet changes
      starknet.on('accountsChanged', (accounts) => {
        setAddress(accounts[0]);
        // Refresh the account when the address changes
        setAccount(starknet.account || starknet);
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

  const getBalance = async () => {
    try {
      if (!account || !address) {
        console.log("No account or address available");
        return null;
      }

      // Use the correct method based on the wallet type
      const balance = typeof account.getStraightBalance === 'function'
        ? await account.getStraightBalance()
        : typeof account.getBalance === 'function'
          ? await account.getBalance()
          : null;

      console.log("Raw balance from wallet:", balance);
      return balance;

    } catch (error) {
      console.error("Error getting balance:", error);
      return null;
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

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const starknet = await connect({
          modalMode: 'neverAsk',
        });
        
        if (starknet && starknet.isConnected) {
          setWallet(starknet);
          setAccount(starknet.account || starknet);
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
        getBalance,
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