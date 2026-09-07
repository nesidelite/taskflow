import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Global Typographic Hierarchy: Incremented base hierarchy by 1 level across entire app
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.25rem" }], // 13px (Base upgrade from 12px)
        sm: ["0.9375rem", { lineHeight: "1.375rem" }], // 15px (Base upgrade from 14px)
        base: ["1.0625rem", { lineHeight: "1.625rem" }], // 17px (Base upgrade from 16px)
        lg: ["1.1875rem", { lineHeight: "1.75rem" }], // 19px (Base upgrade from 18px)
        xl: ["1.375rem", { lineHeight: "1.875rem" }], // 22px (Base upgrade from 20px)
        "2xl": ["1.625rem", { lineHeight: "2.125rem" }], // 26px (Base upgrade from 24px)
        "3xl": ["2rem", { lineHeight: "2.375rem" }], // 32px (Base upgrade from 30px)
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
