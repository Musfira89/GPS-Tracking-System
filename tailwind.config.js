/** @type {import('tailwindcss').Config} */
const config = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sora: ["Sora", "sans-serif"],
        },
        colors: {
          primary: "#8750f7",
          secondary: "#2a1454",
        },
      },
    },
    plugins: [],
  };
  
  export default config;
  