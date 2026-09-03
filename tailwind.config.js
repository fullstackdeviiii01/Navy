/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        // Main theme colors for entire application
        theme: {
          // Backgrounds
          'bg-light': '#E5E5E5',        // Theme Light Background
          'bg-dark': '#3A2C13',         // Dark Mode Background
          'surface-light': '#E5E5E5',   // Theme Light Surface
          'surface-dark': '#3A2C13',    // Dark surface
          'card-light': '#E5E5E5',      // Theme Light Card Surface
          'card-dark': '#48381A',       // Dark card surface
          
          // Text colors
          'text-primary-light': '#241910',  // User requested Light Mode Main text
          'text-primary-dark': '#D7D3CF',   // User requested Dark Mode Main text
          'text-secondary-light': '#5A4638', // Secondary text in light mode
          'text-secondary-dark': '#B8B2AB',  // Secondary text in dark mode
          'text-muted-light': '#7D6A5A',     // Muted text in light mode
          'text-muted-dark': '#A69E96',      // Muted text in dark mode
          
          // Buttons & Interactive Elements
          'primary': '#C59345',         // Signature Gold button
          'primary-hover': '#A8752B',   // Rich gold hover
          'primary-dark': '#C59345',    // Gold primary
          'btn-text': '#FFFFFF',        // Button text color (#FFFFFF)
          'secondary': '#5A4638',       // Secondary button
          'secondary-hover': '#7D6A5A', // Secondary button hover
          
          // Interactive states & Hover
          'hover-light': '#A8752B',     // User requested Clickable hover color
          'hover-dark': '#C99648',      // Dark clickable hover
          'hover-bg-light': '#E9DFCE',  // Light hover background
          'hover-bg-dark': '#48381A',   // Dark hover background
          'border-light': '#E0D4C3',    // Light borders
          'border-dark': '#554220',     // Dark borders
          
          // Status colors (essential ones)
          'success': '#15803d',         // green-700
          'error': '#b91c1c',           // red-700
          'warning': '#d97706',         // amber-600
        },
        
        // Legacy support
        background: "var(--background)",
        foreground: "var(--foreground)",
      }
    },
  },
  plugins: [flowbite.plugin(),require('@tailwindcss/typography'),],
  darkMode: 'class', // Ensure dark mode is enabled
};