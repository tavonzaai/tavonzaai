/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.1)",
        background: "#000000",
        foreground: "#ffffff",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
        poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
        dmsans: ["var(--font-dm-sans)", "DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
