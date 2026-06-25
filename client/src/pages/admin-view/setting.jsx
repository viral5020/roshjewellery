import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa'; // Import Font Awesome icons for sun and moon
import { BsArrowLeftRight } from 'react-icons/bs'; // Import arrow icon for LTR/RTL toggle
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Import collapse/expand icons for sidebar
import { FiMaximize, FiMinimize } from 'react-icons/fi'; // Import full screen icons

const SettingsPage = () => {
  // Set theme state from localStorage or default to light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Set direction state from localStorage or default to ltr
  const [direction, setDirection] = useState(() => {
    return localStorage.getItem('direction') || 'ltr';
  });

  // Set sidebar collapse state
  const [collapsed, setCollapsed] = useState(false);

  // Full-screen state
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Store the theme choice in localStorage
  };

  // Toggle between LTR and RTL directions
  const toggleDirection = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    localStorage.setItem('direction', newDirection); // Store the direction choice in localStorage
  };

  // Toggle sidebar collapse state
  const toggleSidebarCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Toggle full-screen mode
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen(); // Firefox
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(); // Chrome, Safari, Opera
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen(); // IE/Edge
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen(); // Firefox
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Chrome, Safari, Opera
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen(); // IE/Edge
      }
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    // Apply theme class to the body element
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);

    // Apply the text direction to the body element
    document.body.setAttribute('dir', direction);
  }, [theme, direction]); // Re-run effect when theme or direction changes

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Settings</h2>

      {/* Theme Setting */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Theme Mode</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Choose between light and dark themes for a personalized experience.</p>
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
          <span className="text-lg text-gray-900 dark:text-white">
            {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'} Theme
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
              className="sr-only"
            />
            {/* Custom Toggle Button */}
            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-600 rounded-full relative flex items-center transition-all duration-300 ease-in-out">
              {/* Toggle Ball */}
              <span
                className={`w-7 h-7 bg-white dark:bg-gray-800 rounded-full shadow-lg absolute transition-all duration-300 ease-in-out transform ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'} flex items-center justify-center`}
              >
                {/* Sun and Moon icons inside the toggle */}
                {theme === 'light' ? (
                  <FaSun className="text-yellow-500 text-xl" />
                ) : (
                  <FaMoon className="text-gray-300 text-xl" />
                )}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Direction Setting (LTR/RTL) */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Text Direction</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Choose between left-to-right and right-to-left text direction.</p>
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
          <span className="text-lg text-gray-900 dark:text-white">
            {direction === 'ltr' ? 'Switch to RTL' : 'Switch to LTR'} Direction
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={direction === 'rtl'}
              onChange={toggleDirection}
              className="sr-only"
            />
            {/* Custom Direction Toggle Button */}
            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-600 rounded-full relative flex items-center transition-all duration-300 ease-in-out">
              {/* Toggle Ball */}
              <span
                className={`w-7 h-7 bg-white dark:bg-gray-800 rounded-full shadow-lg absolute transition-all duration-300 ease-in-out transform ${direction === 'rtl' ? 'translate-x-0' : 'translate-x-8'} flex items-center justify-center`}
              >
                {/* LTR/RTL icon */}
                <BsArrowLeftRight className="text-gray-500 text-xl" />
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Sidebar Collapse Option */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sidebar</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Toggle the sidebar visibility for a compact view.</p>
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
          <span className="text-lg text-gray-900 dark:text-white">
            {collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={collapsed}
              onChange={toggleSidebarCollapse}
              className="sr-only"
            />
            {/* Custom Sidebar Collapse Toggle Button */}
            <div className="w-16 h-8 bg-gray-200 dark:bg-gray-600 rounded-full relative flex items-center transition-all duration-300 ease-in-out">
              {/* Toggle Ball */}
              <span
                className={`w-7 h-7 bg-white dark:bg-gray-800 rounded-full shadow-lg absolute transition-all duration-300 ease-in-out transform ${collapsed ? 'translate-x-8' : 'translate-x-0'} flex items-center justify-center`}
              >
                {collapsed ? (
                  <ChevronRight className="text-gray-500 text-xl" />
                ) : (
                  <ChevronLeft className="text-gray-500 text-xl" />
                )}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Full-Screen Option */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Full Screen</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Toggle to switch to full-screen mode.</p>
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
          <span className="text-lg text-gray-900 dark:text-white">
            {isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          </span>
          <button
            onClick={toggleFullScreen}
            className="text-xl text-gray-900 dark:text-white"
          >
            {isFullScreen ? <FiMinimize /> : <FiMaximize />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
