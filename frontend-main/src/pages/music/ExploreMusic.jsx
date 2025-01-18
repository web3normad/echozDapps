import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Contract } from "starknet";
import { Rocket, Award } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Contract address and ABI
const MUSIC_CONTRACT_ADDRESS =
  "0x44414ebe24856f8ee4653f94dd1c4b839a02d2dce73c938d1c8aa2c4e099342";

const MusicPlatformABI = [
  {
    type: "function",
    name: "get_all_song_ids",
    inputs: [],
    outputs: [{ type: "core::array::Span::<core::integer::u256>" }],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "get_song_details",
    inputs: [{ name: "song_id", type: "core::integer::u256" }],
    outputs: [
      {
        type: "(core::felt252, core::felt252, core::felt252, core::felt252, core::integer::u256, core::integer::u256)",
      },
    ],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "buy_shares",
    inputs: [
      { name: "song_id", type: "core::integer::u256" },
      { name: "shares_count", type: "core::integer::u256" },
    ],
    outputs: [],
    state_mutability: "external",
  },
];

const ExplorePage = () => {
  const navigate = useNavigate(); // Use navigate from react-router-dom
  const [exploreMode, setExploreMode] = useState("trending");
  const [musicTracks, setMusicTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalTrack, setModalTrack] = useState(null);
  const [sharesToBuy, setSharesToBuy] = useState("");

  const fetchMusicTracks = async () => {
    setIsLoading(true);
    try {
      if (!window.starknet) {
        throw new Error("Starknet wallet not detected");
      }

      await window.starknet.enable();
      const account = await window.starknet.account;

      const contract = new Contract(MusicPlatformABI, MUSIC_CONTRACT_ADDRESS, account);

      // Get all song IDs
      const response = await contract.get_all_song_ids();
      const trackIds = response[0]; // Adjust based on your contract's return format

      const tracks = await Promise.all(
        trackIds.map(async (songId) => {
          try {
            const response = await contract.get_song_details(songId);
            const [name, genre, ipfsAudioHash, ipfsArtworkHash, totalShares, sharePrice] = response[0];

            return {
              id: songId.toString(),
              title: name,
              genre,
              coverImage: `https://gateway.pinata.cloud/ipfs/${ipfsArtworkHash}`,
              songUrl: `https://gateway.pinata.cloud/ipfs/${ipfsAudioHash}`,
              availableShares: totalShares.low.toString(),
              pricePerShare: (Number(sharePrice.low) / 1e18).toString(),
            };
          } catch (err) {
            console.error(`Error fetching details for song ${songId}:`, err);
            return null;
          }
        })
      );

      setMusicTracks(tracks.filter((track) => track !== null));
    } catch (err) {
      setError(`Failed to fetch music tracks: ${err.message}`);
      toast.error(`Error fetching tracks: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMusicTracks();
  }, []);

  const handleBuyShares = async (track) => {
    try {
      if (!track) {
        toast.error("Track data is missing!");
        return;
      }

      if (!window.starknet) {
        toast.error("Starknet wallet not detected");
        return;
      }

      if (!sharesToBuy || isNaN(Number(sharesToBuy)) || Number(sharesToBuy) <= 0) {
        toast.error("Please enter a valid number of shares.");
        return;
      }

      await window.starknet.enable();
      const account = await window.starknet.account;

      const contract = new Contract(MusicPlatformABI, MUSIC_CONTRACT_ADDRESS, account);

      const sharesCount = {
        low: sharesToBuy,
        high: "0",
      };

      const { transaction_hash } = await contract.buy_shares(track.id, sharesCount);

      await account.waitForTransaction(transaction_hash);

      toast.success(`Successfully bought ${sharesToBuy} shares of ${track.title}!`);
      fetchMusicTracks();
      setModalTrack(null);
    } catch (error) {
      console.error("Error buying shares:", error);
      toast.error(`Failed to buy shares: ${error.message}`);
    }
  };

  const modeButtons = [
    { name: "trending", icon: Rocket },
    { name: "new", icon: Award },
  ];

  const renderMusicCards = () => {
    if (isLoading) {
      return <div className="text-center">Loading tracks...</div>;
    }

    if (error) {
      return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {musicTracks.map((track) => (
          <div
            key={track.id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
          >
            <img
              src={track.coverImage}
              alt={track.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{track.title}</h3>
              <p className="text-gray-400 mb-2">Genre: {track.genre}</p>
              <p className="text-gray-400 mb-4">
                Available Shares: {track.availableShares}
              </p>
              <p className="text-[#04e3cb] mb-4">
                Price per Share: {track.pricePerShare} ETH
              </p>
              <button
                onClick={() => setModalTrack(track)}
                className="w-full bg-[#04e3cb] text-black py-2 rounded-lg hover:bg-[#03b09d] transition-colors"
              >
                Buy Shares
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 text-white">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6 text-[#04e3cb]">Music Investment Hub</h1>

      <div className="flex space-x-4 mb-6">
        {modeButtons.map((mode) => (
          <button
            key={mode.name}
            onClick={() => setExploreMode(mode.name)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              exploreMode === mode.name
                ? "bg-[#04e3cb] text-black"
                : "bg-cyan-100 text-gray-500 hover:bg-cyan-200"
            }`}
          >
            <mode.icon className="w-4 h-4" />
            <span className="capitalize">{mode.name}</span>
          </button>
        ))}
      </div>

      {renderMusicCards()}

      {modalTrack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Buy Shares - {modalTrack.title}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Number of Shares
              </label>
              <input
                type="number"
                value={sharesToBuy}
                onChange={(e) => setSharesToBuy(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded-lg"
                min="1"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleBuyShares(modalTrack)}
                className="flex-1 bg-[#04e3cb] text-black py-2 rounded-lg hover:bg-[#03b09d]"
              >
                Confirm Purchase
              </button>
              <button
                onClick={() => setModalTrack(null)}
                className="flex-1 bg-gray-600 py-2 rounded-lg hover:bg-gray-500"
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
