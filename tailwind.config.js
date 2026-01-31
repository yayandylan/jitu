/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Ini memastikan seluruh web otomatis pakai Poppins (Modern & Clean)
        sans: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [
    // Plugin ini KUNCI agar hasil chat AI (Markdown) jadi cantik & rapi
    require('@tailwindcss/typography'), 
  ],
};