import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Contract, uint256, shortString } from "starknet";
import { connect } from "get-starknet";
import MusicContractABI from "../../../ABI/MusicStreamABI.json";

const MUSIC_CONTRACT_ADDRESS = "0x00356077b414bb3fda4f8ef1e44bc2a3fd7eb108b722eeeaec08917468c425bd";

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

  const ipfsHashToFelt = (hash) => {
    const cleanHash = hash.replace(/^(Qm|bafy)/, "");
    const truncatedHash = cleanHash
      .split("")
      .map((char) => char.charCodeAt(0).toString(16))
      .join("")
      .slice(0, 31);

    return `0x${truncatedHash}`;
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

      const musicFileIPFSHash = await uploadToPinata({
        file: newRelease.musicFile,
        type: "music",
      });

      const albumCoverIPFSHash = await uploadToPinata({
        file: newRelease.albumCover,
        type: "cover",
      });

      const contract = new Contract(MusicContractABI, MUSIC_CONTRACT_ADDRESS, provider);
      contract.connect(starknet.account);

      const name = shortString.encodeShortString(newRelease.name.trim());
      const genre = shortString.encodeShortString(newRelease.genre);
      const musicHash = ipfsHashToFelt(musicFileIPFSHash);
      const artworkHash = ipfsHashToFelt(albumCoverIPFSHash);

      const totalShares = uint256.bnToUint256(
        newRelease.totalShares && Number(newRelease.totalShares) >= 0
          ? BigInt(newRelease.totalShares)
          : BigInt(100)
      );

      const sharePrice = uint256.bnToUint256(
        newRelease.sharePrice && Number(newRelease.sharePrice) >= 0
          ? BigInt(Math.floor(parseFloat(newRelease.sharePrice) * 1e18))
          : BigInt(1e16)
      );

      const { transaction_hash } = await contract.invoke("upload_song", [
        name,
        genre,
        musicHash,
        artworkHash,
        totalShares,
        sharePrice,
      ]);

      await provider.waitForTransaction(transaction_hash);
      toast.success("Song uploaded successfully!");

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
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Rest of your component JSX remains the same
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <ToastContainer />
      <div className="border-white dark:bg-[#252727] w-full max-w-5xl rounded-2xl shadow-2xl p-8">
        <h3 className="text-3xl font-extrabold text-[#04e3cb] mb-6 text-center">
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
              className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
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
              className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
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
              <UploadCloud className="w-12 h-12 mx-auto text-[#04e3cb]" />
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
              <ImageIcon className="w-12 h-12 mx-auto text-[#04e3cb]" />
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
              className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
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
              className="w-full p-3 bg-[#1A1C1C] text-white rounded-xl"
              placeholder="Enter share price (default: 0.01 STRK)"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 px-5 mt-4 bg-[#04e3cb] text-gray-700 text-lg font-semibold rounded-xl transition-all duration-300 hover:bg-[#38837b] ${
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