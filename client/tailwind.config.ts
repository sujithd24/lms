import type { Config } from "tailwindcss";

// Theme tokens are HSL triplets defined in globals.css, so opacity modifiers
// such as `bg-card/60` work on every semantic color.
const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      colors: {
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        background: token("background"),
        foreground: token("foreground"),
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
        },
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },
        sidebar: {
          DEFAULT: token("sidebar-background"),
          foreground: token("sidebar-foreground"),
          primary: token("sidebar-primary"),
          "primary-foreground": token("sidebar-primary-foreground"),
          accent: token("sidebar-accent"),
          "accent-foreground": token("sidebar-accent-foreground"),
          border: token("sidebar-border"),
          ring: token("sidebar-ring"),
        },
        customgreys: {
          primarybg: "#070B17",
          secondarybg: "#0E1428",
          darkGrey: "#0A0F1F",
          darkerGrey: "#1B2440",
          dirtyGrey: "#8B95B0",
        },
        primary: {
          "50": "#EEF2FF",
          "100": "#E0E7FF",
          "200": "#C7D2FE",
          "300": "#A5B4FC",
          "400": "#818CF8",
          "500": "#6366F1",
          "600": "#5B54E8",
          "700": "#4F46E5",
          "750": "#4338CA",
          "800": "#3730A3",
          "900": "#312E81",
          "950": "#1E1B4B",
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
        },
        secondary: {
          "50": "#ECFEFF",
          "100": "#CFFAFE",
          "200": "#A5F3FC",
          "300": "#67E8F9",
          "400": "#22D3EE",
          "500": "#06B6D4",
          "600": "#0891B2",
          "700": "#22D3EE",
          "800": "#155E75",
          "900": "#164E63",
          "950": "#083344",
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        white: {
          DEFAULT: "#FFFFFF",
          "50": "#CBD5E1",
          "100": "#F8FAFC",
        },
        tertiary: {
          "50": "#F59E0B",
        },
        aurora: {
          indigo: "#6366F1",
          violet: "#A855F7",
          cyan: "#22D3EE",
          pink: "#EC4899",
        },
        chart: {
          "1": token("chart-1"),
          "2": token("chart-2"),
          "3": token("chart-3"),
          "4": token("chart-4"),
          "5": token("chart-5"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "aurora-a": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "33%": { transform: "translate3d(8vw, 6vh, 0) scale(1.15)" },
          "66%": { transform: "translate3d(-6vw, 10vh, 0) scale(0.92)" },
        },
        "aurora-b": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(-10vw, -8vh, 0) scale(1.2)" },
        },
        "aurora-c": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1.05)" },
          "40%": { transform: "translate3d(6vw, -10vh, 0) scale(0.9)" },
          "80%": { transform: "translate3d(-4vw, 4vh, 0) scale(1.1)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "aurora-a": "aurora-a 22s ease-in-out infinite",
        "aurora-b": "aurora-b 28s ease-in-out infinite",
        "aurora-c": "aurora-c 34s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "marquee-reverse": "marquee 45s linear infinite reverse",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-dm-sans)", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        md: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(99 102 241 / 0.35), 0 10px 40px -10px rgb(99 102 241 / 0.55)",
        "glow-cyan": "0 0 0 1px rgb(34 211 238 / 0.3), 0 10px 40px -12px rgb(34 211 238 / 0.5)",
        lift: "0 24px 60px -24px rgb(0 0 0 / 0.75)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), "prettier-plugin-tailwindcss"],
} satisfies Config;

export default config;
