import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Contract, shortString, uint256 } from "starknet";
import { connect } from "get-starknet";
import MusicContractABI from "../../../ABI/MusicStreamABI.json";
import { base58btc } from 'multiformats/bases/base58';

const MUSIC_CONTRACT_ADDRESS = "0x008116e28d9b4767a530ec96d4c84ce31d0e5b157880bc589a58effd7203202c";

const UploadMusic = () => {
  const [newRelease, setNewRelease] = useState({
    name: "",
    genre: "",
    musicFile: null,
    albumCover: null,
    totalShares: "",
    sharePrice: "",
  });

  const [isUploading, setIsUploading] = useState(false);

  const musicFileInputRef = useRef(null);
  const albumCoverInputRef = useRef(null);

  // Helper function to split and process IPFS hash
  const processIPFSHash = (hash) => {
    // Add 'z' prefix if not present
    if (!hash.startsWith('z')) {
      hash = `z${hash}`;
    }
  
    // Decode Base58 IPFS hash to bytes
    const decodedBytes = base58btc.decode(hash);
  
    // Convert bytes to hex string using TextEncoder and slice into chunks
    const chunks = [];
    for (let i = 0; i < decodedBytes.length; i += 31) {
      const chunk = decodedBytes.slice(i, i + 31);
      
      // Convert the byte array to hex string
      const hexString = Array.from(chunk).map(byte => byte.toString(16).padStart(2, '0')).join('');
      
      chunks.push(`0x${hexString}`);
    }
  
    return chunks;
  };
  
  

  const uploadToPinata = async ({ file, type }) => {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error("Invalid file passed to uploadToPinata");
      }

      const formData = new FormData();
      formData.append("file", file);

      const pinataMetadata = JSON.stringify({
        name: type === "music" ? "Uploaded Music" : "Album Cover",
        keyvalues: { type: type },
      });
      formData.append("pinataMetadata", pinataMetadata);

      const pinataOptions = JSON.stringify({ cidVersion: 0 });
      formData.append("pinataOptions", pinataOptions);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to upload ${type} to Pinata: ${error.error.message}`);
      }

      const result = await response.json();
      return result.IpfsHash;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRelease((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setNewRelease((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const validateForm = () => {
    if (!newRelease.name || !newRelease.name.trim()) {
      throw new Error("Song name is required");
    }
    if (!newRelease.musicFile) {
      throw new Error("Music file is required");
    }
    if (!newRelease.albumCover) {
      throw new Error("Album cover is required");
    }
    if (!newRelease.genre) {
      throw new Error("Genre is required");
    }
    if (!newRelease.totalShares || Number(newRelease.totalShares) <= 0) {
      throw new Error("Total shares must be a positive number");
    }
    if (!newRelease.sharePrice || Number(newRelease.sharePrice) <= 0) {
      throw new Error("Share price must be a positive number");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
  
    try {
      validateForm();
  
      const starknet = await connect();
      if (!starknet) {
        throw new Error("Please install and connect a StarkNet wallet");
      }
  
      const provider = starknet.provider;
      if (!provider) {
        throw new Error("No provider found");
      }
  
      const walletAddress = starknet.selectedAddress;
      if (!walletAddress) {
        throw new Error("Please connect your wallet first");
      }
  
      console.log("Uploading files to Pinata...");
      const musicFileIPFSHash = await uploadToPinata({
        file: newRelease.musicFile,
        type: "music",
      });
  
      const albumCoverIPFSHash = await uploadToPinata({
        file: newRelease.albumCover,
        type: "cover",
      });
  
      console.log("Creating contract instance...");
      const contract = new Contract(
        MusicContractABI,
        MUSIC_CONTRACT_ADDRESS,
        provider
      );
      contract.connect(starknet.account);
  
      // Use the raw IPFS hash (without chunking)
      const musicHash = musicFileIPFSHash;
      const artworkHash = albumCoverIPFSHash;
  
      const name = shortString.encodeShortString(newRelease.name.trim());
      const genre = shortString.encodeShortString(newRelease.genre);
  
      const totalSharesBn = BigInt(newRelease.totalShares);
      const sharePriceBn = BigInt(Math.floor(parseFloat(newRelease.sharePrice) * 1e18));
  
      console.log("Contract call parameters:", {
        name,
        genre,
        musicHash,
        artworkHash,
        totalShares: { low: totalSharesBn, high: 0n },
        sharePrice: { low: sharePriceBn, high: 0n }
      });
  
      const result = await contract.invoke(
        "upload_song",
        [
          name,
          genre,
          musicHash, // Pass the IPFS hash as a string
          artworkHash, // Pass the album cover IPFS hash as a string
          { low: totalSharesBn, high: 0n },
          { low: sharePriceBn, high: 0n },
        ],
        {
          maxFee: 9999999999,
        }
      );
  
      console.log("Transaction result:", result);
      await provider.waitForTransaction(result.transaction_hash);
  
      toast.success("Song uploaded successfully!");
  
      // Reset form
      setNewRelease({
        name: "",
        genre: "",
        musicFile: null,
        albumCover: null,
        totalShares: "",
        sharePrice: "",
      });
  
      if (musicFileInputRef.current) musicFileInputRef.current.value = null;
      if (albumCoverInputRef.current) albumCoverInputRef.current.value = null;
  
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = error.message;
  
      if (error.message.includes("insufficient")) {
        errorMessage = "Insufficient funds for transaction. Please check your wallet balance.";
      } else if (error.message.includes("rejected")) {
        errorMessage = "Transaction was rejected. Please try again.";
      }
  
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Rest of your component JSX remains the same
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <ToastContainer />
      <div className="border-white dark:bg-dark-primary-300 w-full max-w-5xl rounded-2xl shadow-2xl p-8">
        <h3 className="text-3xl font-extrabold text-[#cc5a7e] mb-6 text-center">
          Upload Your Music
        </h3>
        <form className="space-y-6" onSubmit={handleFormSubmit}>
          {/* Song Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Song Name
            </label>
            <input
              type="text"
              name="name"
              value={newRelease.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-dark-primary-400 text-white rounded-xl"
              placeholder="Enter song name"
              required
            />
          </div>

          {/* Genre Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Genre
            </label>
            <select
              name="genre"
              value={newRelease.genre}
              onChange={handleInputChange}
              className="w-full p-3 bg-dark-primary-400 text-white rounded-xl"
              required
            >
              <option value="">Select genre</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Hip-Hop">Hip-Hop</option>
              <option value="Jazz">Jazz</option>
              <option value="Classical">Classical</option>
              <option value="Electronic">Electronic</option>
            </select>
          </div>

          {/* Music File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Music File
            </label>
            <div
              className="border-dashed border-2 border-gray-300 rounded-lg p-6 cursor-pointer"
              onClick={() => musicFileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={musicFileInputRef}
                name="musicFile"
                onChange={handleFileChange}
                className="hidden"
                accept=".mp3,.wav"
                required
              />
              <UploadCloud className="w-12 h-12 mx-auto text-[#cc5a7e]" />
              <p className="mt-4 text-center text-white text-lg">
                {newRelease.musicFile 
                  ? newRelease.musicFile.name 
                  : "Click to upload music file"}
              </p>
            </div>
          </div>

          {/* Album Cover Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Album Cover
            </label>
            <div
              className="border-dashed border-2 border-gray-300 rounded-lg p-6 cursor-pointer"
              onClick={() => albumCoverInputRef.current?.click()}
            >
              <input
                type="file"
                ref={albumCoverInputRef}
                name="albumCover"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                required
              />
              <ImageIcon className="w-12 h-12 mx-auto text-[#cc5a7e]" />
              <p className="mt-4 text-center text-white text-lg">
                {newRelease.albumCover 
                  ? newRelease.albumCover.name 
                  : "Click to upload album cover"}
              </p>
            </div>
          </div>

          {/* Total Shares Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Shares
            </label>
            <input
              type="number"
              name="totalShares"
              value={newRelease.totalShares}
              onChange={handleInputChange}
              className="w-full p-3 bg-dark-primary-400 text-white rounded-xl"
              placeholder="Enter total shares (default: 100)"
            />
          </div>

          {/* Share Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Share Price (in STRK)
            </label>
            <input
              type="number"
              name="sharePrice"
              value={newRelease.sharePrice}
              onChange={handleInputChange}
              className="w-full p-3 bg-dark-primary-400 text-white rounded-xl"
              placeholder="Enter share price (default: 0.01 STRK)"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 px-5 mt-4 bg-[#cc5a7e] text-gray-800 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-[#38837b] ${
              isUploading && "cursor-not-allowed opacity-50"
            }`}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Music"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadMusic;