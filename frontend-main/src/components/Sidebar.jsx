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
import Logo from "../assets/img/echoz-logo.svg"

const Sidebar = () => {
  const location = useLocation();

  // Menu items configuration
  const menuItems = [
    { label: 'Streaming', icon: Home, link: '/stream-music' },
    { label: 'Explore Music', icon: Search, link: '/explore-music' },
  ];

  const generalItems = [
    { label: 'Subscription', icon: Crown, link: '/subscription', isNew: true },
    { label: 'Log Out', icon: LogOut, link: '/logout' },
  ];

  return (
    <div className="bg-light-primary-100 dark:bg-dark-primary-200 dark:text-white dark:border-r border-r-slate-400 shadow-lg h-screen w-72">
      {/* Sidebar Header */}
      <div className="text-6xl pt-4 pl-4 font-bold text-light-primary-500 dark:text-[#cc5a7e] mb-4 flex items-center justify-start space-x-2">
       <img src={Logo} alt="echoz logo" className='w-16 h-16'/>
       <h1 className='text-4xl text-[#cc5a7e] text-justify font-bold' style={{ fontFamily: "'League Spartan', serif" }}>
        echoz
      </h1>

      </div>

      {/* Main Menu */}
      <div className="">
        <p className="px-4 text-light-primary-200 dark:text-light-primary-200 uppercase text-sm font-bold">Menu</p>
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
        <p className="px-4 mt-6 text-light-primary-200 dark:text-light-primary-200 uppercase text-sm font-bold">
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
          <p className="text-xs text-light-primary-200 dark:text-light-primary-200">
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
        isActive
          ? 'bg-light-primary-200 dark:bg-dark-primary-100 text-light-primary-500 dark:text-[#cc5a7e]'
          : 'hover:bg-light-primary-100 hover:text-gray-700 dark:hover:bg-dark-primary-200'
      }`}
    >
      {isActive && (
        <div className="absolute right-0 top-0 h-full w-1 bg-[#cc5a7e] rounded-r"></div>
      )}
      <Link to={link} className="flex items-center w-full">
        <Icon className={`text-light-primary-500 dark:text-light-primary-200 ${isActive ? 'text-[#cc5a7e]' : ''}`} />
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
