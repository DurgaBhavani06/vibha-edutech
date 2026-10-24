import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vibha: {
          navy: "#102A43",
          "navy-dark": "#0B1D30",
          "navy-light": "#243B53",
          teal: "#0D9488",
          "teal-dark": "#0F766E",
          "teal-light": "#14B8A6",
          "teal-subtle": "#CCFBF1",
          grey: "#F0F4F8",
          slate: "#334E68",
          "slate-light": "#627D98",
          "slate-border": "#D9E2EC",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
