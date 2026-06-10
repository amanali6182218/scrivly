import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          50: "#fffaf3",
          100: "#fef3e7",
          200: "#fce3c4",
          300: "#fad0a0",
          400: "#f7ad5e",
          500: "#f3922f",
          600: "#e07a1c",
          700: "#bb6118",
          800: "#954d18",
          900: "#7a4116",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
