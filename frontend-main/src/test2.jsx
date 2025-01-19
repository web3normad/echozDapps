import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import blockies from "ethereum-blockies";
import { NavLink } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [balance, setBalance] = useState("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const { 
    wallet, 
    address, 
    connectWallet, 
    disconnectWallet,
  } = useWallet();

  const fetchBalance = async () => {
    if (!wallet || !address) return;

    try {
      setIsLoadingBalance(true);
      // Using the wallet's getBalance method directly instead of contract
      const balanceResponse = await wallet.account.getBalance(address);
      
      // Convert balance to ETH (assuming 18 decimals)
      const formattedBalance = (Number(balanceResponse.toString()) / 1e18).toFixed(4);
      setBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setIsDropdownOpen(false);
    setBalance("0");
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    // Only add listener if dropdown is open
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]); // Add isDropdownOpen to dependency array

  useEffect(() => {
    if (wallet && address) {
      fetchBalance();
      const intervalId = setInterval(fetchBalance, 30000);
      return () => clearInterval(intervalId);
    }
  }, [wallet, address]);

  const truncateWalletAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
      return ""; // Return empty string or default avatar URL
    }
  };

  return (
    <nav className="flex justify-between items-center bg-light-primary-100 dark:bg-dark-primary-100 text-light-primary-500 dark:text-white p-4 z-10">
      <div className="flex-grow max-w-lg">
        <input
          type="text"
          placeholder="Search by artists, songs or albums"
          className="w-full px-4 py-2 rounded-md bg-zinc-100 dark:bg-[#26394f] text-black dark:text-white placeholder-gray-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center space-x-4">
        {!address ? (
          <button 
            onClick={connectWallet}
            className="px-8 py-2 rounded-md bg-[#22577a] dark:bg-[#22577a] hover:bg-light-primary-400 dark:hover:bg-dark-primary-400 transition-colors duration-200 text-white"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center border border-[#2e4357] rounded-xl justify-between space-x-4 px-5 py-2 w-72 cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors duration-200 text-white"
            >
              <img
                src={generateBlockie(address)}
                alt="Profile"
                className="rounded-md w-8 h-8"
              />
              <div className="flex flex-col items-start flex-grow">
                <span className="font-semibold">User</span>
                <span className="text-gray-500 text-sm">
                  {truncateWalletAddress(address)}
                </span>
                <span className="text-gray-400 text-sm">
                  {isLoadingBalance ? "Loading..." : `${balance} ETH`}
                </span>
              </div>
              <ChevronDown
                className={`transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-zinc-800 dark:bg-zinc-700 border border-zinc-700 dark:border-zinc-600 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-zinc-700 dark:border-zinc-600">
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="text-lg font-semibold">
                    {isLoadingBalance ? "Loading..." : `${balance} ETH`}
                  </div>
                </div>
                <div className="py-1">
                  <NavLink
                    to="/artist"
                    className={({ isActive }) =>
                      `flex items-center w-full px-4 py-2 text-left hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors ${
                        isActive ? "bg-zinc-700 dark:bg-zinc-600" : ""
                      }`
                    }
                  >
                    <User className="mr-3 w-4 h-4" />
                    Profile
                  </NavLink>
                  <NavLink
                    to="/upload-music"
                    className={({ isActive }) =>
                      `flex items-center w-full px-4 py-2 text-left hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors ${
                        isActive ? "bg-zinc-700 dark:bg-zinc-600" : ""
                      }`
                    }
                  >
                    <Settings className="mr-3 w-4 h-4" />
                    Add Music
                  </NavLink>
                  <NavLink
                    to="/investor"
                    className={({ isActive }) =>
                      `flex items-center w-full px-4 py-2 text-left hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors ${
                        isActive ? "bg-zinc-700 dark:bg-zinc-600" : ""
                      }`
                    }
                  >
                    <Settings className="mr-3 w-4 h-4" />
                    Investor
                  </NavLink>
                  <div className="border-t border-zinc-700 dark:border-zinc-600 my-1"></div>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center w-full px-4 py-2 text-left text-red-500 hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="mr-3 w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;