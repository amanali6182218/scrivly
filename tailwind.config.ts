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
        brand: {
          orange: "#FFB800",
          pink: "#FF3D8B",
          purple: "#7B2FFF",
        },
        bg: {
          primary: "#000000",
          secondary: "#0D0D0D",
          card: "#111111",
          elevated: "#1A1A1A",
          input: "#0A0A0A",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A0A0A0",
          muted: "#555555",
        },
        border: {
          DEFAULT: "#222222",
          active: "#FF3D8B",
        },
      },
      backgroundImage: {
        brand: "linear-gradient(135deg, #FFB800 0%, #FF3D8B 50%, #7B2FFF 100%)",
        "brand-subtle":
          "linear-gradient(135deg, rgba(255,184,0,0.15) 0%, rgba(255,61,139,0.15) 50%, rgba(123,47,255,0.15) 100%)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
