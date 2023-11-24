/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 'primary-green': '#50FF6C',
        "dark-bg": "#0E1525",
        "dark-bg-2": "#1C2333",
        "dark-hover": "#2B3245",
        "monaco-color": "#3C3C3C",
        "hover-blue": "#04395E",
        "vscode-blue": "#4078CE",
        "git-orange": "#F05033",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
