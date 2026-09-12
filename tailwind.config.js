/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F111A",
        panel: "#171A26",
        panel2: "#1E2232",
        line: "#2A2F42",
        mist: "#9AA3BE",
        paper: "#F4F5FA",
        signal: "#6C5CE7",
        signal2: "#8E7CFF",
        ember: "#FFB454",
        good: "#3DD68C",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
