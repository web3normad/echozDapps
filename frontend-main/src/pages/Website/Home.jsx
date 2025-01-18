import React, { useState } from 'react';
import { ChevronRight, Music, Coins, Share2, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnimatedButton = ({ children, className, ...props }) => (
  <button
    className={`
      px-6 py-3 
      rounded-xl 
      font-semibold 
      transition-all 
      duration-300 
      ease-in-out
      flex items-center 
      justify-center 
      space-x-2 
      shadow-lg 
      hover:shadow-xl 
      hover:scale-105 
      active:scale-95 
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div 
    className="
      bg-[#1F2937] 
      p-6 
      rounded-lg 
      transform 
      transition-all 
      duration-300 
      hover:scale-105 
      hover:shadow-xl 
      border 
      border-transparent 
      hover:border-[#04e3cb]
      group
    "
  >
    <div className="mb-4 text-[#04e3cb]">
      <Icon className="w-12 h-12" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);

const LandingPage = () => {
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted email:', email);
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1F2937] bg-opacity-90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-3xl font-bold text-[#04e3cb] flex items-center space-x-2">
           {/* <img src={Logo} alt="Quiimo Logo" className='w-16' /> */}
            <span>Quiimo</span>
          </div>
          <div className="space-x-6 flex items-center">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Services</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Advisor</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Sign in</a>
            <AnimatedButton 
              className="bg-[#04e3cb] text-black hover:bg-opacity-90"
            >
              Sign Up
            </AnimatedButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-40 pb-16 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 md:pr-12 text-center md:text-left">
          <h1 className="text-6xl font-extrabold mb-4 leading-tight">
            Quiimo Music <br /> <span className="text-gray-400">Empowering Independent Artists</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Quiimo Music is an on-chain music streaming platform designed to empower independent artists by helping them monetize their music.
          </p>
          <Link to="/stream-music">
          <AnimatedButton className="bg-[#04e3cb] text-black">
            Get Started <ChevronRight className="w-5 h-5" />
          </AnimatedButton>
          </Link>
        </div>

        {/* Hero Image */}
        <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
          <div className="relative">
            {/* <img 
              src={Imageone} 
              alt="Artist"
              className="rounded-3xl shadow-xl"
            /> */}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon={Music}
          title="Upload Your Music"
          description="Artists can upload their music and set a percentage of ownership shares to sell."
        />
        <FeatureCard
          icon={Coins}
          title="Sell Ownership Shares"
          description="Receive payments directly from users who purchase your ownership shares."
        />
        <FeatureCard
          icon={Share2}
          title="Revenue Distribution"
          description="Streaming revenue is distributed proportionally to all shareholders, ensuring fairness."
        />
      </div>

      {/* Engagement Section */}
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-4xl font-bold mb-4 text-[#04e3cb]">A Unique Opportunity</h2>
        <p className="text-lg text-gray-400 mb-6">
          Quiimo bridges the gap between artists and fans, creating a unique investment and engagement opportunity for everyone.
        </p>
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute w-16 h-16 bg-[#04e3cb] rounded-full animate-ping"></div>
            <div className="relative w-16 h-16 bg-[#04e3cb] text-black flex items-center justify-center font-bold rounded-full">
              97%
            </div>
          </div>
          <p className="text-gray-400 mt-4">People love to listen to music</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1F2937] py-12 text-center">
        <div className="text-2xl font-bold text-[#04e3cb] mb-2">Quiimo</div>
        <p className="text-gray-400 mb-4">Empowering Artists, Engaging Fans</p>
        <div className="space-x-4">
          <a href="#" className="text-gray-300 hover:text-white">Privacy</a>
          <a href="#" className="text-gray-300 hover:text-white">Terms</a>
          <a href="#" className="text-gray-300 hover:text-white">Contact</a>
        </div>
        <p className="text-gray-500 mt-4">&copy; 2024 Quiimo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
