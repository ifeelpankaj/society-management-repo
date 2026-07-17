/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#ff6a1a",
          soft: "#fff7f1",
        },
        operational: {
          primary: "#0d9488",
          soft: "#f0fdfa",
        },
        surface: {
          screen: "#f8fafc",
          card: "#ffffff",
        },
        status: {
          success: "#16a34a",
          warning: "#d97706",
          error: "#dc2626",
        },
      },
    },
  },
  plugins: [],
};
