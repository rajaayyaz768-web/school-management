import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Falcon College",
  description: "Falcon College — Empowering Education, Inspiring Excellence. The premier college management & information portal.",
  icons: {
    icon: "/falcon-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('theme-preference');
                  const parsed = saved ? JSON.parse(saved) : null;
                  if (parsed?.state?.isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body
        className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${instrumentSans.variable} ${instrumentSerif.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


