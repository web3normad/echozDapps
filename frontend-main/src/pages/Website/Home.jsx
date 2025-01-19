import React, { useState } from 'react';
import { ChevronRight, Music, Coins, Share2, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Imageone from "../../assets/img/imagetwo.png"
import Logo from "../../assets/img/echoz-logo.svg"

const AnimatedButton = ({ children, className, ...props }) => (
  <button
    className={`
      px-6 py-3 
      rounded-full 
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
      bg-[#0e1a29] 
      p-6 
      rounded-lg 
      transform 
      transition-all 
      duration-300 
      hover:scale-105 
      hover:shadow-xl 
      border 
      border-transparent 
      hover:border-[#9b445f]
      group
    "
  >
    <div className="mb-4 text-[#cc5a7e]">
      <Icon className="w-12 h-12 text-[#cc5a7e]" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-[#cc5a7e]">{title}</h3>
    <p className="text-[#cc5a7e] text-sm">{description}</p>
  </div>
);

const LandingPage = () => {
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted email:', email);
  };

  return (
    <div className="bg-[#070c1c] min-h-screen text-[#cc5a7e]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0e1a29] bg-opacity-90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center">
         <div className="text-2xl pt-2 pl-4 font-bold text-light-primary-500 dark:text-[#cc5a7e] mb-4 flex items-center justify-start space-x-2">
               <img src={Logo} alt="echoz logo" className='w-16 h-16'/>
               <h1 className='text-5xl text-[#cc5a7e] text-justify font-bold' style={{ fontFamily: "'League Spartan', serif" }}>
                echoz
              </h1>
        
              </div>
          <div className="space-x-6 flex items-center">
            <a href="#" className="text-[#cc5a7e] hover:text-white transition-colors">Home</a>
            <a href="#" className="text-[#cc5a7e] hover:text-white transition-colors">About</a>
            <a href="#" className="text-[#cc5a7e] hover:text-white transition-colors">Services</a>
            <a href="#" className="text-[#cc5a7e] hover:text-white transition-colors">Advisor</a>
            <a href="#" className="text-[#cc5a7e] hover:text-white transition-colors">Sign in</a>
            <AnimatedButton 
              className="bg-[#cc5a7e] text-black hover:bg-opacity-90"
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
            Echoz Music <br /> <span className="text-[#cc5a7e]">Empowering Independent Artists</span>
          </h1>
          <p className="text-lg text-[#cc5a7e] mb-8">
            Echoz Music is an on-chain music streaming platform designed to empower independent artists by helping them monetize their music.
          </p>
          <Link to="/stream-music">
            <AnimatedButton className="bg-[#cc5a7e] text-black">
              Get Started <ChevronRight className="w-5 h-5 text-[#cc5a7e]" />
            </AnimatedButton>
          </Link>
        </div>

        {/* Hero Image */}
        <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
          <div className="relative">
            <img 
              src={Imageone} 
              alt="Artist"
              className="rounded-3xl shadow-xl"
            />
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
        <h2 className="text-4xl font-bold mb-4 text-[#cc5a7e]">A Unique Opportunity</h2>
        <p className="text-lg text-[#cc5a7e] mb-6">
          Echoz bridges the gap between artists and fans, creating a unique investment and engagement opportunity for everyone.
        </p>
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute w-16 h-16 bg-[#cc5a7e] rounded-full animate-ping"></div>
            <div className="relative w-16 h-16 bg-[#cc5a7e] text-black flex items-center justify-center font-bold rounded-full">
              97%
            </div>
          </div>
          <p className="text-[#cc5a7e] mt-4">People love to listen to music</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0e1a29] py-12 text-center">
        <div className="text-2xl font-bold text-[#cc5a7e] mb-2">Echoz</div>
        <p className="text-[#cc5a7e] mb-4">Empowering Artists, Engaging Fans</p>
        <div className="space-x-4">
          <a href="#" className="text-[#cc5a7e] hover:text-white">Privacy</a>
          <a href="#" className="text-[#cc5a7e] hover:text-white">Terms</a>
          <a href="#" className="text-[#cc5a7e] hover:text-white">Contact</a>
        </div>
        <p className="text-[#cc5a7e] mt-4">&copy; 2024 Echoz. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
