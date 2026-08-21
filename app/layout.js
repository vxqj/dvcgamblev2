import "./globals.css";
import { Archivo_Black, Space_Grotesk, JetBrains_Mono } from "next/font/google";

const archivo = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Nugget List",
  description: "Cast your vote. Live public leaderboard.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${grotesk.variable} ${mono.variable}`}
    >
      <body>
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
