import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "../context/WalletContext";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [balance, setBalance] = useState("0");

  const { 
    wallet, 
    address, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  // Debug logging
  useEffect(() => {
    console.log("Wallet:", wallet);
    console.log("Address:", address);
  }, [wallet, address]);

  const fetchBalance = async () => {
    console.log("Fetching balance...");
    if (!wallet || !address) {
      console.log("No wallet or address");
      return;
    }

    try {
      // Log the wallet object to see its structure
      console.log("Wallet object:", wallet);
      
      // For Starknet.js
      const balance = await wallet.getBalance(address);
      console.log("Raw balance:", balance);
      
      const formattedBalance = (Number(balance.toString()) / 1e18).toFixed(4);
      console.log("Formatted balance:", formattedBalance);
      setBalance(formattedBalance);
    } catch (error) {
      console.error("Detailed balance error:", error);
      setBalance("Error");
    }
  };

  useEffect(() => {
    if (wallet && address) {
      fetchBalance();
    }
  }, [wallet, address]);

  return (
    <div className="p-4">
      {!address ? (
        <button 
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            {address.slice(0, 6)}...{address.slice(-4)} ({balance} ETH)
          </button>

          {isDropdownOpen && (
            <div className="absolute mt-2 bg-white shadow-lg rounded p-2">
                  <button
                onClick={async () => {
                  await disconnectWallet();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Home
              </button>
              <button
                onClick={async () => {
                  await disconnectWallet();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={async () => {
                  await disconnectWallet();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
               Setting
              </button>
              <button
                onClick={async () => {
                  await disconnectWallet();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;