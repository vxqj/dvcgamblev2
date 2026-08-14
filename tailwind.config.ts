import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
        "7.5": "1.875rem",
        "8.5": "2.125rem",
        "9.5": "2.375rem",
      },
      colors: {
        bg: "#08080a",
        bgAlt: "#0d0d10",
        panel: "#131318",
        panel2: "#18181e",
        line: "#26262e",
        lineSoft: "#1c1c22",
        ink: "#f1efe6",
        inkDim: "#96959e",
        inkMute: "#5e5d66",
        blood: "#c81e3a",
        bloodBright: "#ff3355",
        bloodDim: "#7a1524",
        gold: "#e8b44d",
      },
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 18px rgba(200,30,58,0.5)",
      },
      keyframes: {
        holoshift: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        floatp: {
          "0%,100%": { transform: "translateY(0)", opacity: "0.9" },
          "50%": { transform: "translateY(-60px)", opacity: "0.15" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        dmgpop: {
          "0%": { opacity: "0", transform: "translateY(0) scale(0.6)" },
          "20%": { opacity: "1", transform: "translateY(-14px) scale(1.15)" },
          "80%": { opacity: "1", transform: "translateY(-26px) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-40px) scale(0.9)" },
        },
        ring: {
          "0%": { boxShadow: "0 0 0 0 rgba(255,51,85,0.7)" },
          "100%": { boxShadow: "0 0 0 26px rgba(255,51,85,0)" },
        },
      },
      animation: {
        holoshift: "holoshift 5s linear infinite",
        floatp: "floatp 3.5s ease-in-out infinite",
        spinslow: "spin 4s linear infinite",
        dmgpop: "dmgpop 1s ease forwards",
        ring: "ring .5s ease forwards",
      },
    },
  },
  plugins: [],
};
export default config;
