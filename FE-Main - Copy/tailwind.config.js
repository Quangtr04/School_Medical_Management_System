// tailwind.config.js
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  // <-- Change 'module.exports =' to 'export default'
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Your custom font families
        sans: ['"Roboto"', "ui-sans-serif", "system-ui", "sans-serif"],
        headingSans: [
          '"Open Sans"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        // Add other custom fonts here if needed, e.g., 'headingSerif', 'body', etc.
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            p: {
              "margin-bottom": "1.25em",
              "line-height": "1.75",
            },
            li: {
              "margin-bottom": "0.75em",
              "line-height": "1.75",
            },
            h2: {
              "margin-top": "2em",
              "margin-bottom": "1.25em",
              "font-size": theme("fontSize.3xl")[0],
              "font-weight": theme("fontWeight.semibold"),
              // If you were to use a custom font family defined above:
              // "font-family": theme('fontFamily.headingSans'),
            },
            h3: {
              "margin-top": "2em",
              "margin-bottom": "1.25em",
              "font-style": "italic",
              "font-size": theme("fontSize.2xl")[0],
              "font-weight": theme("fontWeight.semibold"),
              // If you were to use a custom font family defined above:
              // "font-family": theme('fontFamily.headingSans'),
            },
            // ... thêm các thẻ khác
          },
        },
      }),
    },
  },
  plugins: [typography],
};
