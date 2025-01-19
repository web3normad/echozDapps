import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "../context/WalletContext";
import { Link } from "react-router-dom";
import blockies from "ethereum-blockies";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [balance, setBalance] = useState("0");

  const { 
    wallet, 
    address,
    account,
    connectWallet, 
    disconnectWallet,
    getBalance
  } = useWallet();

  const fetchBalance = async () => {
    try {
      if (!account || !address) {
        console.log("No account or address");
        return;
      }

      const balanceResult = await getBalance();
      console.log("Raw balance result:", balanceResult);
      
      if (balanceResult) {
        // Convert to string if it's not already
        const balanceStr = balanceResult.toString();
        console.log("Balance string:", balanceStr);
        
        // Convert to STRK (18 decimals)
        const formattedBalance = (Number(balanceStr) / 1e18).toFixed(4);
        console.log("Formatted balance:", formattedBalance);
        
        if (!isNaN(formattedBalance)) {
          setBalance(formattedBalance);
        } else {
          console.error("Invalid balance format");
          setBalance("0");
        }
      } else {
        console.log("No balance data received");
        setBalance("0");
      }
    } catch (error) {
      console.error("Balance fetch error:", error);
      setBalance("0");
    }
  };

  useEffect(() => {
    if (account && address) {
      fetchBalance();
      
      // Set up interval to refresh balance periodically
      const intervalId = setInterval(fetchBalance, 30000); // Every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [account, address]);

  const handleNavigation = () => {
    setIsDropdownOpen(false);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setIsDropdownOpen(false);
  };

  const generateBlockie = (address) => {
    try {
      return blockies.create({
        seed: address || "default",
        size: 8,
        scale: 4,
      }).toDataURL();
    } catch (error) {
      console.error("Error generating blockie:", error);
      return "";
    }
  };

  return (
    <div className="flex justify-between items-center bg-dark-primary-100 text-light-primary-500 dark:text-white p-4 z-10">
      <div className="flex-grow max-w-lg">
        <input
          type="text"
          placeholder="Search by artists, songs or albums"
          className="w-full px-4 py-2 rounded-md bg-zinc-100 dark:bg-[#26394f] text-black dark:text-white placeholder-gray-500 focus:outline-none"
        />
      </div>
      {!address ? (
        <button 
          onClick={connectWallet}
          className="px-4 py-2 bg-dark-primary-400 text-white rounded-full"
        >
          Connect Wallet
        </button>
      ) : (
        <div ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-dark-primary-500 text-white rounded-full"
          >
            <img
              src={generateBlockie(address)}
              alt="Profile"
              className="rounded-md w-8 h-8"
            />
            {address.slice(0, 6)}...{address.slice(-4)} {balance} STRK
          </button>

          {isDropdownOpen && (
            <div className="absolute mt-4 mr-4 bg-dark-primary-100 shadow-lg rounded p-2">
              <Link to="/artist" onClick={handleNavigation}>
                <button className="w-full text-left px-4 py-2 hover:bg-dark-primary-500 rounded-xl">
                  Profile
                </button>
              </Link>
              <Link to="/upload-music" onClick={handleNavigation}>
                <button className="w-full text-left px-4 py-2 hover:bg-dark-primary-500 rounded-xl">
                  Upload
                </button>
              </Link>
              <button
                onClick={handleDisconnect}
                className="w-full text-left px-4 py-2 hover:bg-dark-primary-500 rounded-xl">
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