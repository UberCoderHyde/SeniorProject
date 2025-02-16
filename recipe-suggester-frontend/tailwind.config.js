/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6347",
        secondary: "#FFA07A",
        tertiary: "#000000",
        accent: "#20B2AA",
        highlight: "#32CD32",
      },
    },
  },
  plugins: [],
}

