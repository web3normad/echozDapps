import React, { useState, useEffect } from "react";
import { Contract, defaultProvider } from "starknet";
import { Rocket, Award } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MusicContractABI from "../../../ABI/MusicStreamABI.json";

const MUSIC_CONTRACT_ADDRESS = "0x008116e28d9b4767a530ec96d4c84ce31d0e5b157880bc589a58effd7203202c";

const ExplorePage = () => {
  const [exploreMode, setExploreMode] = useState("trending");
  const [musicTracks, setMusicTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [sharesToBuy, setSharesToBuy] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // Updated decode function to handle BigInt values
  const decodeHexString = (value) => {
    if (!value) return '';
    
    // Convert BigInt to hex string
    let hexString = value.toString(16);
    
    // Ensure even length
    if (hexString.length % 2 !== 0) {
      hexString = '0' + hexString;
    }
    
    let str = '';
    for (let i = 0; i < hexString.length; i += 2) {
      const byte = parseInt(hexString.substr(i, 2), 16);
      if (byte === 0) break;
      str += String.fromCharCode(byte);
    }
    return str.trim();
  };

  const fetchMusicTracks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = defaultProvider;
      const contract = new Contract(MusicContractABI, MUSIC_CONTRACT_ADDRESS, provider);

      const response = await contract.get_all_song_ids();
      console.log("Raw song IDs:", response);
      
      const songIds = Array.isArray(response) ? response : [response];

      const tracks = await Promise.all(
        songIds.map(async (songId) => {
          try {
            const songDetails = await contract.get_song_details(songId);
            console.log(`Song details for ID ${songId}:`, songDetails);

            // Convert contract values to BigInt
            const nameValue = BigInt(songDetails[0].toString());
            const genreValue = BigInt(songDetails[1].toString());
            const musicHash = songDetails[2]?.toString();
            const artworkHash = songDetails[3]?.toString();
            const totalShares = songDetails[4]?.toString();
            const sharePrice = songDetails[5]?.toString();

            // Decode the name and genre
            const name = decodeHexString(nameValue);
            const genre = decodeHexString(genreValue);

            console.log(`Decoded values for song ${songId}:`, {
              name,
              genre,
              musicHash,
              artworkHash,
              totalShares,
              sharePrice
            });

            return {
              id: songId.toString(),
              title: name || 'Untitled',
              genre: genre || 'Unknown Genre',
              coverImage: `https://ipfs.io/ipfs/${artworkHash}`,
              songUrl: `https://ipfs.io/ipfs/${musicHash}`,
              availableShares: totalShares || '0',
              pricePerShare: sharePrice ? (parseInt(sharePrice) / 1e18).toFixed(4) : '0'
            };
          } catch (err) {
            console.error(`Error processing song ID ${songId}:`, err);
            return null;
          }
        })
      );

      const validTracks = tracks.filter(track => track !== null);
      
      if (validTracks.length === 0) {
        throw new Error("No valid tracks found");
      }

      console.log('Processed tracks:', validTracks);
      setMusicTracks(validTracks);
    } catch (err) {
      setError(`Failed to fetch music tracks: ${err.message}`);
      toast.error(`Error fetching tracks: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseClick = (track) => {
    setSelectedTrack(track);
    setShowPurchaseModal(true);
  };

  const handlePurchaseConfirm = async () => {
    if (!selectedTrack || !sharesToBuy || isNaN(sharesToBuy) || sharesToBuy <= 0) {
      toast.error("Please enter a valid number of shares");
      return;
    }

    setPurchaseLoading(true);
    try {
      const provider = defaultProvider;
      const contract = new Contract(MusicContractABI, MUSIC_CONTRACT_ADDRESS, provider);

      const shareAmount = parseInt(sharesToBuy);
      const totalCost = BigInt(selectedTrack.pricePerShare) * BigInt(shareAmount);

      const tx = await contract.buy_shares(
        selectedTrack.id,
        shareAmount,
        { value: totalCost.toString() }
      );

      await provider.waitForTransaction(tx.transaction_hash);
      toast.success(`Successfully purchased ${shareAmount} shares!`);
      setShowPurchaseModal(false);
      fetchMusicTracks();
    } catch (err) {
      toast.error(`Purchase failed: ${err.message}`);
    } finally {
      setPurchaseLoading(false);
    }
  };

  useEffect(() => {
    fetchMusicTracks();
  }, []);

  return (
    <div className="container mx-auto p-6 text-white">
      <ToastContainer />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#cc5a7e] mb-2">Music Marketplace</h1>
        <p className="text-gray-400">Invest in your favorite music tracks with STRK</p>
      </div>

      {/* Mode Selection */}
      <div className="flex space-x-4 mb-8">
        {[
          { name: "trending", icon: Rocket },
          { name: "new", icon: Award },
        ].map((mode) => (
          <button
            key={mode.name}
            onClick={() => setExploreMode(mode.name)}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-full transition-all
              ${exploreMode === mode.name
                ? "bg-[#cc5a7e] text-black"
                : "bg-dark-primary-300 text-white hover:bg-[#353535]"}
            `}
          >
            <mode.icon className="w-5 h-5" />
            <span className="capitalize font-medium">{mode.name}</span>
          </button>
        ))}
      </div>

      {/* Track Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-primary-400 h-64 rounded-lg mb-4"></div>
              <div className="h-4 bg-dark-primary-400 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-dark-primary-400 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {musicTracks.map((track) => (
            <div
              key={track.id}
              className="bg-[#252727] rounded-lg overflow-hidden transition-transform hover:scale-[1.02]"
            >
              <div className="relative">
                <img
                  src={track.coverImage}
                  alt={track.title}
                  className="w-full aspect-square object-cover"
                  onError={(e) => {
                    e.target.src = "/default_cover.jpg";
                  }}
                />
                <div className="absolute top-2 right-2 bg-[#cc5a7e] text-black px-3 py-1 rounded-full text-sm">
                  {track.genre}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-bold mb-1">{track.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available Shares</span>
                    <span className="font-medium">{track.availableShares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price per Share</span>
                    <span className="font-medium text-[#cc5a7e]">{track.pricePerShare} STRK</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchaseClick(track)}
                  className="w-full bg-[#cc5a7e] text-black py-3 rounded-full font-medium hover:bg-[#cc5a7e] transition-colors"
                >
                  Purchase Shares
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedTrack && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-dark-primary-100 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl text-[#cc5a7e] font-bold mb-4">Purchase Shares</h2>
            
            <div className="mb-6">
              <p className="text-gray-200 mb-2">Track: {selectedTrack.title}</p>
              <p className="text-gray-200 mb-4">Price per Share: {selectedTrack.pricePerShare} STRK</p>
              
              <label className="block text-sm font-medium mb-2">
                Number of Shares
              </label>
              <input
                type="number"
                value={sharesToBuy}
                onChange={(e) => setSharesToBuy(e.target.value)}
                className="w-full bg-dark-primary-400 border border-gray-700 rounded-lg px-4 py-2"
                placeholder="Enter amount"
              />
              
              {sharesToBuy && !isNaN(sharesToBuy) && (
                <p className="mt-2 text-[#cc5a7e]">
                  Total Cost: {BigInt(selectedTrack.pricePerShare) * BigInt(sharesToBuy)} STRK
                </p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handlePurchaseConfirm}
                disabled={purchaseLoading}
                className={`flex-1 bg-[#cc5a7e] text-black py-3 rounded-full font-medium
                  ${purchaseLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#cc5a7e]'}`}
              >
                {purchaseLoading ? 'Processing...' : 'Confirm Purchase'}
              </button>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 bg-gray-600 text-white py-3 rounded-full font-medium hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;