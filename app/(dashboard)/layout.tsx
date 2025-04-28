export const maxDuration = 300;
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Providers } from "../providers";
import Tabs from "../components/Tabs";
import Header from "../components/Header";
import "../globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Micron | SuplySense",
  description: "Powered by Digital Trinity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased bg-dt-primary`}>
        <Providers>
          <Header />
          <main className="flex flex-col items-center justify-center flex-grow px-4">
            <div className="w-full max-w-7xl flex flex-col">
              <Tabs />
              <div className="bg-white p-6 rounded-lg rounded-tl-none shadow-lg">
                {children}
              </div>
            </div>
          </main>
          <footer className="flex items-center justify-center p-4 bg-dt-secondary text-white">
            <p>Powered by Digital Trinity</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
