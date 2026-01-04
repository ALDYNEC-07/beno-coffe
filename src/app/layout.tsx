/*
 Этот файл задает общий каркас для всех страниц.
 Он показывает общий HTML и обертку body.
 Здесь позже можно разместить общие элементы.
*/
import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {/* Здесь показывается каждая страница внутри общего каркаса. */}
        {children}
      </body>
    </html>
  );
}
