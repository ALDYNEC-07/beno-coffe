/*
 This file defines the base shell for every page.
 It shows the shared HTML and body wrapper.
 A person can place shared elements here later.
*/
import type { Metadata } from "next";

// This stores the page title and short description for the browser.
export const metadata: Metadata = {
  title: "New Site",
  description: "Clean starting point",
};

// This runs automatically for every page to wrap its content.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* This is where each page is shown inside the shared shell. */}
        {children}
      </body>
    </html>
  );
}
