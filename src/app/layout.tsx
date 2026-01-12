/*
 Этот файл задает общий каркас для всех страниц.
 Он показывает общий HTML и обертку body.
 Здесь позже можно разместить общие элементы.
*/
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

// Здесь подключаются шрифты для заголовков и основного текста на сайте.
const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});
const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Здесь хранится заголовок страницы и короткое описание для браузера.
export const metadata: Metadata = {
  title: "BENO COFFEE",
  description: "Clean starting point",
};

// Этот блок автоматически оборачивает содержимое каждой страницы.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable}`}
    >
      <body>
        {/* Здесь показывается каждая страница внутри общего каркаса. */}
        {children}
      </body>
    </html>
  );
}
