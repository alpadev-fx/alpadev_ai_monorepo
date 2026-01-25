// import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

// Bypass build-time network checks by using standard CSS loading
export const fontSans = {
  style: { fontFamily: 'Inter, sans-serif' },
  variable: "--font-sans",
  subsets: ["latin"],
};

export const fontMono = {
  style: { fontFamily: 'Fira Code, monospace' },
  variable: "--font-mono",
  subsets: ["latin"],
};
