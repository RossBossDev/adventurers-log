/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "al-bg": "#14110d",
        "al-card": "#baa479",
        "al-card-light": "#d5c08f",
        "al-ink": "#17110a",
        "al-cream": "#f7e8be",
        "al-muted": "#6a5840",
        "al-moss": "#31583b",
        "al-moss-light": "#3f6a49",
        "al-forest": "#17291c",
        "al-error": "#7f1d1d",
        "al-error-bg": "#fee2c5",
        "al-error-cream": "#fff7ed",
      },
      borderRadius: {
        "al-sm": "6px",
        "al-md": "10px",
        "al-lg": "16px",
      },
      fontFamily: {
        display: ["Kalam_700Bold"],
      },
    },
  },
  plugins: [],
};
