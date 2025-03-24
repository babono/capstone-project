import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Providers } from "../../providers";
import "../../globals.css";

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
      <body
        className={`${roboto.variable} antialiased bg-dt-primary`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
