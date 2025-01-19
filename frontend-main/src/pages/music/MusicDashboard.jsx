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
  Shuffle
} from "lucide-react";
import { Contract, defaultProvider } from "starknet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MusicContractABI from "../../../ABI/MusicStreamABI.json";

const MUSIC_CONTRACT_ADDRESS = "0x008116e28d9b4767a530ec96d4c84ce31d0e5b157880bc589a58effd7203202c";

const MusicStreamPage = () => {
  // State management
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // Updated Utility Functions
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

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Updated Fetch Music Tracks
  const fetchTracks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = defaultProvider;
      const contract = new Contract(MusicContractABI, MUSIC_CONTRACT_ADDRESS, provider);

      const response = await contract.get_all_song_ids();
      const songIds = Array.isArray(response) ? response : [response];

      const fetchedTracks = await Promise.all(
        songIds.map(async (songId) => {
          try {
            const songDetails = await contract.get_song_details(songId);
            console.log(`Song details for ID ${songId}:`, songDetails);

            // Convert BigInt values to regular numbers before processing
            const nameValue = BigInt(songDetails[0].toString());
            const genreValue = BigInt(songDetails[1].toString());
            const musicHash = songDetails[2]?.toString();
            const artworkHash = songDetails[3]?.toString();

            const title = decodeHexString(nameValue);
            const genre = decodeHexString(genreValue);

            console.log(`Decoded title: ${title}, genre: ${genre}`);

            return {
              id: songId.toString(),
              title: title || 'Untitled',
              genre: genre || 'Unknown Genre',
              coverUrl: `https://ipfs.io/ipfs/${artworkHash}`,
              songUrl: `https://ipfs.io/ipfs/${musicHash}`
            };
          } catch (error) {
            console.error(`Error processing song ID ${songId}:`, error);
            return null;
          }
        })
      );

      const validTracks = fetchedTracks.filter(track => track !== null);
      console.log('Processed tracks:', validTracks);
      
      setTracks(validTracks);
      if (!currentTrack && validTracks.length > 0) {
        setCurrentTrack(validTracks[0]);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
      setError(error.message);
      toast.error(`Failed to load tracks: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Player Controls
  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackSelect = (index) => {
    setTrackIndex(index);
    setCurrentTrack(tracks[index]);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    let nextIndex = isShuffle 
      ? Math.floor(Math.random() * tracks.length)
      : (trackIndex + 1) % tracks.length;
    setTrackIndex(nextIndex);
    setCurrentTrack(tracks[nextIndex]);
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;
    let prevIndex = isShuffle
      ? Math.floor(Math.random() * tracks.length)
      : trackIndex === 0 ? tracks.length - 1 : trackIndex - 1;
    setTrackIndex(prevIndex);
    setCurrentTrack(tracks[prevIndex]);
  };

  const toggleFavorite = (trackId) => {
    setFavorites(prev => 
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  // Volume and Progress Controls
  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  const handleProgressChange = (e) => {
    const value = parseFloat(e.target.value);
    const time = (value / 100) * duration;
    setProgress(value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Effects
  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.songUrl;
      audioRef.current.load();
      if (isPlaying) audioRef.current.play();
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Music</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchTracks}
            className="bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Main Content */}
      <div className="pt-20 pb-32 px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#cc5a7e] mb-2">Stream Music</h1>
        <p className="text-gray-400">Stream your favorite music tracks</p>
      </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {isLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="bg-[#181818] rounded-lg p-4 animate-pulse">
                <div className="w-full aspect-square bg-gray-700 rounded-md mb-4" />
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            ))
          ) : (
            tracks.map((track, index) => (
              <div
                key={track.id}
                className={`bg-dark-primary-100 rounded-lg p-4 cursor-pointer transition-all hover:bg-[#282828] ${
                  currentTrack?.id === track.id ? 'ring-2 ring-[#cc5a7e]' : ''
                }`}
                onClick={() => handleTrackSelect(index)}
              >
                <div className="relative group">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full aspect-square object-cover rounded-md"
                    onError={(e) => {
                      e.target.src = "/default_cover.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-dark-primary-200 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                    <button
                      className="bg-[#cc5a7e] rounded-full p-3 transform transition-transform hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackSelect(index);
                      }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause size={24} />
                      ) : (
                        <Play size={24} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold truncate">{track.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{track.genre}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Player Controls */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-primary-200 border-t border-gray-800">
          <div className="max-w-screen-xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Track Info */}
              <div className="flex items-center w-1/4">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-14 h-14 rounded-md"
                  onError={(e) => {
                    e.target.src = "/default_cover.jpg";
                  }}
                />
                <div className="ml-3">
                  <h4 className="font-semibold truncate">{currentTrack.title}</h4>
                  <p className="text-sm text-gray-400">{currentTrack.genre}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className="ml-4"
                >
                  <Heart
                    className={favorites.includes(currentTrack.id) ? 'fill-[#cc5a7e] text-[#cc5a7e]' : ''}
                  />
                </button>
              </div>

              {/* Playback Controls */}
              <div className="flex flex-col items-center w-2/4">
                <div className="flex items-center space-x-4 mb-2">
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`hover:text-[#cc5a7e] ${isShuffle ? 'text-[#cc5a7e]' : ''}`}
                  >
                    <Shuffle size={20} />
                  </button>
                  <button
                    onClick={handlePrevious}
                    className="hover:text-[#cc5a7e]"
                  >
                    <SkipBack size={24} />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="bg-[#cc5a7e] rounded-full p-3 hover:bg-[#cc5a7e]"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button
                    onClick={handleNext}
                    className="hover:text-[#cc5a7e]"
                  >
                    <SkipForward size={24} />
                  </button>
                  <button
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={`hover:text-[#cc5a7e] ${isRepeat ? 'text-[#cc5a7e]' : ''}`}
                  >
                    <Repeat size={20} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full flex items-center space-x-2">
                  <span className="text-xs text-gray-400 w-12">
                    {formatTime(currentTime)}
                  </span>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-3
                        [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-white
                        hover:[&::-webkit-slider-thumb]:bg-[#cc5a7e]"
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
{/* Volume Control */}
<div className="flex items-center w-1/4 justify-end space-x-2">
                <button
                  onClick={() => setVolume(prev => (prev === 0 ? 0.5 : 0))}
                  className="hover:text-[#cc5a7e]"
                >
                  {volume === 0 ? (
                    <VolumeX size={20} />
                  ) : volume < 0.5 ? (
                    <Volume1 size={20} />
                  ) : (
                    <Volume2 size={20} />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    hover:[&::-webkit-slider-thumb]:bg-[#cc5a7e]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Audio playback error:', e);
          toast.error('Failed to play track');
        }}
      />

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default MusicStreamPage;