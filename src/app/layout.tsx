import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LiteCode - Free, Online IDE",
  icons: "/litecode.svg",
  keywords: "react, nextjs, typescript, javascript, online, ide, code, editor",
  description: "LiteCode is a browser-based IDE for React app development.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
