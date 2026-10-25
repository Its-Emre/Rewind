/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Warm near-black theatre palette
        ink: {
          950: "#0B0B0F",
          900: "#101016",
          800: "#17171F",
          700: "#21212C",
          600: "#2E2E3C",
        },
        // One warm amber accent — nostalgia, not neon
        ember: {
          300: "#FFCE7A",
          400: "#F5B942",
          500: "#F2A93B",
          600: "#D98E1F",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        fadeUp: "fadeUp .5s ease both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};
