import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}","./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { darwin: { 50:"#f0f4ff",100:"#e0e9ff",200:"#c7d7fd",300:"#a5bbfb",400:"#8096f8",500:"#6371f2",600:"#4f55e7",700:"#3f43ce",800:"#3438a7",900:"#2f3484",950:"#1c1f4d" } }, animation: { "fade-in":"fadeIn 0.4s ease-out","slide-up":"slideUp 0.3s ease-out" }, keyframes: { fadeIn: { "0%":{opacity:"0"},"100%":{opacity:"1"} }, slideUp: { "0%":{opacity:"0",transform:"translateY(12px)"},"100%":{opacity:"1",transform:"translateY(0)"} } } } },
  plugins: [],
};
export default config;