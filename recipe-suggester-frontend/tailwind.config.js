/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FC9F5B",
        secondary: "#FBD1A2",
        tertiary: "#ECE4B7",
        accent: "#7DCFB6",
        highlight: "#33CA7F",
      },
    },
  },
  plugins: [],
}

