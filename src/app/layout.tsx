/*
 Этот файл задает общий каркас для всех страниц.
 Он показывает общий HTML и обертку body.
 Здесь позже можно разместить общие элементы.
*/
import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// Этот блок подключает шрифт для всех заголовков на сайте.
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["700"],
  variable: "--font-heading",
});

// Здесь хранится заголовок страницы и короткое описание для браузера.
export const metadata: Metadata = {
  title: "New Site",
  description: "Clean starting point",
};

// Этот блок автоматически оборачивает содержимое каждой страницы.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cormorantGaramond.variable}>
        {/* Здесь показывается каждая страница внутри общего каркаса. */}
        {children}
      </body>
    </html>
  );
}
