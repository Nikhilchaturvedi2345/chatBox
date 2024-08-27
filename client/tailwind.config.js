/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./dist/message.ejs",
    "./dist/index.ejs",
    "./dist/js/getMessage.js",
    "./dist/js/infoMessage.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#111b21",
        secondary: "#0b141a",
        tertiary : "#202c33",
        button : "#1d94c8",
        message : "#005c4b"
      },
    },
  },
  plugins: [],
};
