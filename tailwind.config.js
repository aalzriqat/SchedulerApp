/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", // For the root App.js
    "./app/**/*.{js,jsx,ts,tsx}", // For Expo Router screens in the 'app' directory
    "./src/screens/**/*.{js,jsx,ts,tsx}", // For your custom screens
    "./src/components/**/*.{js,jsx,ts,tsx}", // For your custom components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [require("nativewind/preset")],
}
