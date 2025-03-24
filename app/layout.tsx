import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Providers } from "./providers";
import Tabs from "./components/Tabs";
import Image from "next/image";
import logoMicron from "../public/logo-micron.svg";
import "./globals.css";

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
          <header className="flex items-center justify-between p-4 bg-dt-secondary">
            <div className="flex items-center">
              <Image src={logoMicron} alt="Micron Logo" width={100} height={22} />
              <div className="mx-3 w-0.5 h-6 bg-white mt-1"></div>
              <h1 className="font-extrabold text-xl pt-1 text-white">SupplySense</h1>
            </div>
          </header>
          <main className="flex flex-col items-center justify-center flex-grow">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
              <Tabs />
              <div className="p-4">
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
