/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./Index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: "var(--blue)",
        background: "var(--bg-color)",
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
    },
  },
  plugins: [],
}
