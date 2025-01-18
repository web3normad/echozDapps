import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Heart,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
} from "lucide-react";
import { connect } from "get-starknet"; // Install this via npm
import { Contract, defaultProvider } from "starknet"; // Import Starknet functionality
import MusicContractABI from "../../../ABI/MusicStreamABI.json"; // Your Starknet contract ABI

// Smart Contract Configuration
const MUSIC_CONTRACT_ADDRESS = "0x00356077b414bb3fda4f8ef1e44bc2a3fd7eb108b722eeeaec08917468c425bd"; // Replace with your contract address

const MusicStreamPage = () => {
  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null); // Store wallet address
  const audioRef = useRef(null);

  const reconstructIpfsHash = (low, high) => {
    if (!low || !high) {
      console.error("Invalid IPFS hash parts:", low, high);
      return null;
    }

    const hash = BigInt(high).toString(16).padStart(32, "0") + BigInt(low).toString(16).padStart(32, "0");
    return hash;
  };

  // Fetch tracks from Starknet contract
  const fetchMusicTracks = async () => {
    try {
      const provider = defaultProvider;
      const contract = new Contract(MusicContractABI, MUSIC_CONTRACT_ADDRESS, provider);

      const response = await contract.get_all_song_ids();
      console.log("Response from contract:", response); // Log the raw response

      if (Array.isArray(response)) {
        const songIds = response.map((bigIntValue) => bigIntValue.toString());

        const tracks = await Promise.all(
          songIds.map(async (songId) => {
            try {
              const {
                artist,
                name,
                genre,
                ipfsAudioHashLow,
                ipfsAudioHashHigh,
                ipfsArtworkHashLow,
                ipfsArtworkHashHigh,
              } = await contract.get_song_details(songId);

              const ipfsAudioHash = reconstructIpfsHash(ipfsAudioHashLow, ipfsAudioHashHigh);
              const ipfsArtworkHash = reconstructIpfsHash(ipfsArtworkHashLow, ipfsArtworkHashHigh);

              if (!ipfsAudioHash || !ipfsArtworkHash) {
                console.error("IPFS hash not found for songId:", songId);
                return null;
              }

              return {
                id: songId || "unknown-id",
                title: name || "Untitled",
                artist: artist || "Unknown Artist",
                genre: genre || "Unknown Genre",
                coverUrl: `https://gateway.pinata.cloud/ipfs/${ipfsArtworkHash}`,
                songUrl: `https://gateway.pinata.cloud/ipfs/${ipfsAudioHash}`,
              };
            } catch (error) {
              console.error("Error fetching details for songId:", songId, error);
              return null;
            }
          })
        );

        setUploadedTracks(tracks.filter((track) => track !== null));
      }
    } catch (error) {
      console.error("Error fetching music tracks:", error);
      setError(error);
    }
  };

  const connectWallet = async () => {
    try {
      const starknet = await connect();
      if (!starknet) throw new Error("Wallet not found");

      await starknet.enable();
      setWalletAddress(starknet.selectedAddress);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    fetchMusicTracks();
  }, []);

  return (
    <div>
      <h1>Music Stream</h1>
      {walletAddress ? (
        <p>Connected as: {walletAddress}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      {error && <p>Error: {error.message}</p>}

      <div>
        {uploadedTracks.length > 0 ? (
          <ul>
            {uploadedTracks.map((track, index) => (
              <li key={track.id}>
                <img src={track.coverUrl} alt={track.title} style={{ width: 100 }} />
                <p>{track.title} by {track.artist}</p>
                <audio controls src={track.songUrl}></audio>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tracks available</p>
        )}
      </div>
    </div>
  );
};

export default MusicStreamPage;
