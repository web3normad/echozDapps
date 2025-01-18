import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import blockies from "ethereum-blockies";
import { NavLink } from "react-router-dom";
import { connect, disconnect } from "starknetkit";
import { Contract, Provider, constants } from "starknet";

// ERC20 token ABI for fetching balance
const erc20Abi = [
  {
    members: [
      {
        name: "low",
        offset: 0,
        type: "felt"
      },
      {
        name: "high",
        offset: 1,
        type: "felt"
      }
    ],
    name: "Uint256",
    size: 2,
    type: "struct"
  },
  {
    inputs: [
      {
        name: "account",
        type: "felt"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "Uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [connection, setConnection] = useState(undefined);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // ETH contract address on Starknet
  const ETH_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

  const fetchBalance = async (wallet) => {
    if (!wallet || !address) return;

    try {
      setIsLoadingBalance(true);
      const provider = new Provider({
        sequencer: {
          network: constants.NetworkName.SN_MAIN
        }
      });
      
      const ethContract = new Contract(erc20Abi, ETH_ADDRESS, provider);
      const balance = await ethContract.balanceOf(address);
      
      // Convert balance from uint256 to string with 18 decimals
      const balanceStr = (BigInt(balance.balance.low) + (BigInt(balance.balance.high) << BigInt(128))).toString();
      const formattedBalance = (Number(balanceStr) / 1e18).toFixed(4);
      
      setBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Connect wallet handler
  const connectWallet = async () => {
    const { wallet, connectorData } = await connect({
      modalMode: "alwaysAsk",
      modalTheme: "dark",
      dappName: "Your App Name",
    });

    if (wallet && connectorData) {
      setConnection(wallet);
      setAddress(connectorData.account);
      fetchBalance(wallet);
    }
  };

  // Disconnect wallet handler
  const disconnectWallet = async () => {
    await disconnect();
    setConnection(undefined);
    setAddress("");
    setBalance("0");
    setIsDropdownOpen(false);
  };

  // Auto-connect on load
  useEffect(() => {
    const connectToStarknet = async () => {
      const { wallet, connectorData } = await connect({ 
        modalMode: "neverAsk",
        modalTheme: "dark"
      });

      if (wallet && wallet.isConnected) {
        setConnection(wallet);
        setAddress(wallet.selectedAddress);
        fetchBalance(wallet);
      }
    };

    connectToStarknet();
  }, []);

  // Refresh balance periodically and on account/network changes
  useEffect(() => {
    if (connection) {
      const intervalId = setInterval(() => {
        fetchBalance(connection);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(intervalId);
    }
  }, [connection, address]);

  // Setup wallet event listeners
  useEffect(() => {
    if (!connection) return;

    const accountChangeHandler = (accounts) => {
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        fetchBalance(connection);
      } else {
        setAddress("");
        setBalance("0");
      }
    };

    const networkChangeHandler = async (chainId, accounts) => {
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        fetchBalance(connection);
      }
    };

    connection.on("accountsChanged", accountChangeHandler);
    connection.on("networkChanged", networkChangeHandler);

    return () => {
      connection.off("accountsChanged", accountChangeHandler);
      connection.off("networkChanged", networkChangeHandler);
    };
  }, [connection]);

  // Truncate wallet address for display
  const truncateWalletAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Generate blockies image
  const generateBlockie = (address) => {
    const blockie = blockies.create({
      seed: address || "user123",
      size: 8,
      scale: 4,
    });
    return blockie.toDataURL();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex justify-between items-center bg-black text-white p-4 z-10">
      {/* Search Bar */}
      <div className="flex-grow max-w-lg">
        <input
          type="text"
          placeholder="Search by artists, songs or albums"
          className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder-gray-500 focus:outline-none"
        />
      </div>

      {/* Wallet Connect and Profile */}
      <div className="flex items-center space-x-4">
        {!address ? (
          <button 
            onClick={connectWallet}
            className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center justify-between space-x-4 px-5 py-2 rounded w-72 cursor-pointer hover:bg-zinc-800 transition-colors duration-200"
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

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50"
                ref={dropdownRef}
              >
                <div className="p-4 border-b border-zinc-700">
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="text-lg font-semibold">
                    {isLoadingBalance ? "Loading..." : `${balance} ETH`}
                  </div>
                </div>
                <div className="py-1">
                  <NavLink
                    to="/artist"
                    className={({ isActive }) =>
                      `flex items-center w-full px-4 py-2 text-left hover:bg-zinc-700 transition-colors ${
                        isActive ? "bg-zinc-700" : ""
                      }`
                    }
                  >
                    <User className="mr-3 w-4 h-4" />
                    Profile
                  </NavLink>
                  <NavLink
                    to="/upload-music"
                    className={({ isActive }) =>
                      `flex items-center w-full px-4 py-2 text-left hover:bg-zinc-700 transition-colors ${
                        isActive ? "bg-zinc-700" : ""
                      }`
                    }
                  >
                    <Settings className="mr-3 w-4 h-4" />
                    Add Music
                  </NavLink>
                  <NavLink
                    to="/investor"
                    className={({ isActive }) =>
                      `flex items-center w-full px-4 py-2 text-left hover:bg-zinc-700 transition-colors ${
                        isActive ? "bg-zinc-700" : ""
                      }`
                    }
                  >
                    <Settings className="mr-3 w-4 h-4" />
                    Investor
                  </NavLink>
                  <div className="border-t border-zinc-700 my-1"></div>
                  <button
                    onClick={disconnectWallet}
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