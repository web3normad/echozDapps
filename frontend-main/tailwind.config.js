/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode based on class
  theme: {
    extend: {
      colors: {
        // Light Mode Primary Colors
        light: {
          primary: {
            100: '#f9f3f5',
            200: '#f3e6eb',
            300: '#edc9d5',
            400: '#e7acc0',
            500: '#e18faa', // Default for primary
          },
        },
        // Dark Mode Primary Colors
        dark: {
          primary: {
            100: '#070c1c', // Primary dark color
            200: '#0e1a29',
            300: '#1b2b41',
            400: '#26394f',
            500: '#2e4357', // Lighter shades
          },
        },
      },
      textColor: {
        // Default text color for both light and dark mode
        light: '#cc5a7e', // Light mode text color
        dark: '#cc5a7e', // Dark mode text color
      },

      button:{
        bg: '#e25bb7'
      }
    },
  },
  plugins: [],
}
