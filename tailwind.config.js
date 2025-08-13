/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // verde tipo portal
          50:  "#ECF8E9",
          100: "#D8F1D3",
          200: "#B3E3A9",
          300: "#8FD67F",
          400: "#74C95F",
          500: "#63B246", // principal
          600: "#53A13B",
          700: "#3E7C2C",
          800: "#2D5A20",
          900: "#1F4016",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        heading: ["Montserrat", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        portal: "0 10px 30px rgba(0,0,0,.20)",
      },
      maxWidth: {
        screenxl: "1200px",
      },
    },
  },
  plugins: [],
};
