const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/tailwind-datepicker-react/dist/**/*.js"
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Your customizations here
      fontWeight: {
        'extra-thin': '20',  // Custom weight
      },

    },
  },
  plugins: [],
});

// import type { Config } from "tailwindcss";
// const config: Config = {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   darkMode: ["class"],
//   theme: {
//     extend: {
     
//     },
//   },
//   plugins: [],
// };


// export default config;
