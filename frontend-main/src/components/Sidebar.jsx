import React from 'react';
import {
  Home,
  Search,
  Heart,
  ListMusic,
  Album,
  User,
  Settings,
  Crown,
  LogOut,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
// import Logo from "../assets/images/logo.png"

const Sidebar = () => {
  const location = useLocation();

  // Menu items configuration
  const menuItems = [
    { label: 'Streaming', icon: Home, link: '/stream-music' },
    { label: 'Explore Music', icon: Search, link: '/explore-music' },
    // { label: 'Likes', icon: Heart, link: '/likes' },
    // { label: 'Playlists', icon: ListMusic, link: '/playlists' },
    // { label: 'Albums', icon: Album, link: '/albums' },
    // { label: 'Following', icon: User, link: '/following' },
  ];

  const generalItems = [
    { label: 'Settings', icon: Settings, link: '/settings' },
    { label: 'Subscription', icon: Crown, link: '/subscription', isNew: true },
    { label: 'Log Out', icon: LogOut, link: '/logout' },
  ];

  return (
    <div className="bg-white dark:bg-[#252727] dark:text-white dark:border-r border-r-slate-400 shadow-lg h-screen w-72">
      {/* Sidebar Header */}
      <div className="text-2xl font-bold text-[#04e3cb] flex items-center justify-center space-x-2">
                {/* <img src={Logo} alt="Quiimo Logo" className='w-16' /> */}
                 <span>Quiimo</span>
               </div>

      {/* Main Menu */}
      <div className="mt-4">
        <p className="px-4 text-gray-500 uppercase text-sm font-bold">Menu</p>
        <ul className="space-y-2 mt-2">
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              link={item.link}
              isActive={location.pathname === item.link}
            />
          ))}
        </ul>

        {/* General */}
        <p className="px-4 mt-6 text-gray-500 uppercase text-sm font-bold">
          General
        </p>
        <ul className="space-y-2 mt-2">
          {generalItems.map((item, index) => (
            <MenuItem
              key={index}
              icon={item.icon}
              label={item.label}
              link={item.link}
              isActive={location.pathname === item.link}
              isNew={item.isNew}
            />
          ))}
        </ul>

        {/* Mobile Section */}
        <div className="mt-10 px-4">
          {/* <button className="w-full bg-[#04e3cb] text-white py-2 rounded mb-4">
            Download App
          </button> */}
          <p className="text-xs text-gray-400">
            Legal • Privacy • Terms
          </p>
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, link, isActive, isNew }) => {
  return (
    <li
      className={`relative flex items-center px-4 py-2 cursor-pointer group ${
        isActive ? 'bg-[#dcfffb] dark:text-gray-800' : 'hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {isActive && (
        <div className="absolute right-0 top-0 h-full w-1 bg-[#04e3cb] rounded-r"></div>
      )}
      <Link to={link} className="flex items-center w-full">
        <Icon className={`text-gray-500 ${isActive ? 'text-[#04e3cb]' : ''}`} />
        <span className="ml-4 flex items-center">
          {label}
          {isNew && (
            <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">
              NEW
            </span>
          )}
        </span>
      </Link>
    </li>
  );
};

export default Sidebar;
