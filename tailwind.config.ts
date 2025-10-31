import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        ice: "#f1f5f9",
        accent: {
          DEFAULT: "#7c3aed",
          soft: "#c084fc"
        }
      }
    }
  },
  plugins: []
};

export default config;
