// tailwind.config.js
import typography from "@tailwindcss/typography";
import lineClamp from "@tailwindcss/line-clamp";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            p: {
              "margin-bottom": "1.25em", // Tăng khoảng cách dưới mỗi đoạn văn bản
              "line-height": "1.75", // Tăng chiều cao dòng cho đoạn văn bản
            },
            li: {
              "margin-bottom": "0.75em", // Khoảng cách dưới mỗi mục danh sách
              "line-height": "1.75", // Chiều cao dòng cho mục danh sách
            },
            h2: {
              "margin-top": "2em", // Khoảng cách trên h2
              "margin-bottom": "1.25em",
            },
            // ... thêm các thẻ khác
          },
        },
      }),
    },
  },
  plugins: [typography, lineClamp],
};
