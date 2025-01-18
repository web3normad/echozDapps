"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MUSIC_CONTRACT_ADDRESS =
  "0x44414ebe24856f8ee4653f94dd1c4b839a02d2dce73c938d1c8aa2c4e099342";

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRelease((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setNewRelease((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      if (!newRelease.name.trim() || !newRelease.musicFile || !newRelease.albumCover) {
        toast.error("All fields are required.");
        setIsUploading(false);
        return;
      }

      // Placeholder for upload logic...

      toast.success("Song uploaded successfully!");
      setNewRelease({
        name: "",
        genre: "",
        musicFile: null,
        albumCover: null,
        totalShares: "",
        sharePrice: "",
      });

      if (musicFileInputRef.current) musicFileInputRef.current.value = "";
      if (albumCoverInputRef.current) albumCoverInputRef.current.value = "";
    } catch (error) {
      toast.error("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-6">
      <ToastContainer />
      <div className="border-white bg-base-100 w-full max-w-5xl rounded-2xl shadow-2xl px-8">
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
              className="w-full p-3 bg-base-100 border border-gray-200 text-white rounded-xl"
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
              className="w-full p-3 bg-base-100 border border-gray-200 text-white rounded-xl"
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
              className="w-full bg-base-100 border border-gray-200 p-3 text-white rounded-xl"
              placeholder="Enter total shares (default: 100)"
            />
          </div>

          {/* Share Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Share Price (in ETH)
            </label>
            <input
              type="number"
              name="sharePrice"
              value={newRelease.sharePrice}
              onChange={handleInputChange}
              className="w-full p-3 bg-base-100 border border-gray-200 text-white rounded-xl"
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
