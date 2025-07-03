/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#98A1BC",        // Muted lavender-gray
        "primary-dark": "#555879", // Deep slate blue
        "primary-light": "#DED3C4",// Soft beige-taupe
        secondary: "#F4EBD3",      // Light cream
        accent: "#DED3C4",         // Subtle accent
        surface: "#DED3C4",        // Main panel background
        "text-primary": "#555879",
        "text-secondary": "#98A1BC",
        border: "#98A1BC",
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1.5rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(85 88 121 / 0.05)",
        md: "0 4px 6px -1px rgb(85 88 121 / 0.08), 0 2px 4px -2px rgb(85 88 121 / 0.08)",
        lg: "0 10px 15px -3px rgb(85 88 121 / 0.10), 0 4px 6px -4px rgb(85 88 121 / 0.10)",
        xl: "0 8px 32px 0 rgba(85,88,121,0.10)",
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 