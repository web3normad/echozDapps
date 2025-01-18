import React, { useState, useEffect, useRef } from "react";
import { Contract } from "starknet";
import { connect } from "starknetkit";
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
  Loader 
} from "lucide-react";

// Contract address and ABI
const MUSIC_CONTRACT_ADDRESS = "0x44414ebe24856f8ee4653f94dd1c4b839a02d2dce73c938d1c8aa2c4e099342";

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
  }
];

function MusicStreamPage() {
  // State management
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
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef(null);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      const connection = await connect({
        modalMode: "neverAsk",
        webWalletUrl: "https://web.argent.xyz",
        dappName: "Music Stream Platform",
      });
      
      if (connection && connection.isConnected) {
        setIsConnected(true);
        return connection;
      }
      throw new Error("Failed to connect wallet");
    } catch (error) {
      if (error.message === "User aborted") {
        throw new Error("Wallet connection cancelled. Please try again.");
      }
      throw error;
    }
  };

  // Fetch music tracks
  const fetchMusicTracks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const connection = await connectWallet();
      
      if (!connection || !connection.account) {
        throw new Error("Please connect your wallet to access music");
      }

      const contract = new Contract(
        MusicPlatformABI,
        MUSIC_CONTRACT_ADDRESS,
        connection.account
      );

      // Get all song IDs
      const response = await contract.get_all_song_ids();
      const trackIds = response[0];

      const tracks = await Promise.all(
        trackIds.map(async (songId) => {
          try {
            const response = await contract.get_song_details(songId);
            const [name, artist, genre, ipfsArtworkHash, ipfsAudioHash] = response[0];

            return {
              id: songId.toString(),
              title: name,
              artist: artist,
              genre: genre,
              coverUrl: `https://gateway.pinata.cloud/ipfs/${ipfsArtworkHash}`,
              songUrl: `https://gateway.pinata.cloud/ipfs/${ipfsAudioHash}`,
            };
          } catch (err) {
            console.error(`Error fetching details for song ${songId}:`, err);
            return null;
          }
        })
      );

      const validTracks = tracks.filter((track) => track !== null);
      setUploadedTracks(validTracks);
      if (validTracks.length > 0) {
        setCurrentTrack(validTracks[0]);
      }
    } catch (err) {
      console.error("Error fetching tracks:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMusicTracks();
  }, []);

  // Audio progress tracking
  useEffect(() => {
    const audioElement = audioRef.current;
    const updateProgress = () => {
      if (audioElement) {
        const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
        setProgress(progressPercent);
      }
    };

    audioElement?.addEventListener("timeupdate", updateProgress);
    return () => audioElement?.removeEventListener("timeupdate", updateProgress);
  }, [currentTrack]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Track change handler
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.songUrl;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [currentTrack]);

  // Player controls
  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackSelect = (index) => {
    setTrackIndex(index);
    setCurrentTrack(uploadedTracks[index]);
  };

  const handleNext = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * uploadedTracks.length);
      setTrackIndex(randomIndex);
      setCurrentTrack(uploadedTracks[randomIndex]);
    } else {
      const nextIndex = (trackIndex + 1) % uploadedTracks.length;
      setTrackIndex(nextIndex);
      setCurrentTrack(uploadedTracks[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * uploadedTracks.length);
      setTrackIndex(randomIndex);
      setCurrentTrack(uploadedTracks[randomIndex]);
    } else {
      const prevIndex = trackIndex === 0 ? uploadedTracks.length - 1 : trackIndex - 1;
      setTrackIndex(prevIndex);
      setCurrentTrack(uploadedTracks[prevIndex]);
    }
  };

  const handleRepeatToggle = () => {
    if (!audioRef.current) return;
    setIsRepeat(!isRepeat);
    audioRef.current.loop = !isRepeat;
  };

  const handleShuffleToggle = () => {
    setIsShuffle(!isShuffle);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleFavorite = (trackId) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(trackId)) {
        return prevFavorites.filter((id) => id !== trackId);
      } else {
        return [...prevFavorites, trackId];
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-32 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin mb-4" />
          <p>Loading music library...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-32 text-white flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchMusicTracks}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen p-32 text-white flex">
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Listen Now</h1>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {uploadedTracks.length > 0 ? (
              uploadedTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="hover:bg-[#282828] rounded-lg p-4 cursor-pointer transition-colors group"
                  onClick={() => handleTrackSelect(index)}
                >
                  <div className="relative">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full aspect-square object-cover rounded-md shadow-lg mb-4"
                      onError={(e) => {
                        e.currentTarget.src = "/default_cover.jpg";
                      }}
                    />
                    <button
                      className="absolute bottom-2 right-2 bg-teal-500 text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackSelect(index);
                      }}
                    >
                      <Play fill="black" size={24} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-base truncate mt-2">{track.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No tracks available
              </div>
            )}
          </div>

          {/* Player controls */}
          {currentTrack && (
            <div className="fixed bottom-0 w-[86%] left-42 right-0 p-4 bg-[#282828] border-t border-gray-700">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center mb-2">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="w-16 h-16 mr-4 rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/default_cover.jpg";
                    }}
                  />
                  <div>
                    <h4 className="font-semibold">{currentTrack.title}</h4>
                    <p className="text-sm text-gray-400">{currentTrack.artist}</p>
                  </div>
                  <button
                    onClick={() => handleFavorite(currentTrack.id)}
                    className="ml-4"
                  >
                    <Heart
                      className={`${
                        favorites.includes(currentTrack.id) ? "text-teal-500" : "text-white"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-4 mb-2">
                    <button onClick={handleShuffleToggle}>
                      <Shuffle
                        className={`${
                          isShuffle ? "text-teal-500" : "text-white"
                        }`}
                      />
                    </button>
                    <button onClick={handlePrevious}>
                      <SkipBack />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
                    >
                      {isPlaying ? <Pause fill="black" /> : <Play fill="black" />}
                    </button>
                    <button onClick={handleNext}>
                      <SkipForward />
                    </button>
                    <button onClick={handleRepeatToggle}>
                      <Repeat
                        className={`${
                          isRepeat ? "text-teal-500" : "text-white"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 w-full">
                    <span className="text-xs">
                      {formatTime(audioRef.current?.currentTime || 0)}
                    </span>
                    <div className="flex-1 h-1 bg-gray-600 rounded-full">
                      <div
                        className="bg-teal-500 h-1 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs">
                      {formatTime(audioRef.current?.duration || 0)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    {volume === 0 ? <VolumeX /> : volume < 0.5 ? <Volume1 /> : <Volume2 />}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-32 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <audio
            ref={audioRef}
            onEnded={handleNext}
            style={{ display: "none" }}
          />
        </div>
      </div>
    </div>
  );
}

export default MusicStreamPage