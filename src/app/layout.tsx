import type { Metadata } from 'next';
import { Suspense } from 'react';
import Loading from './loading';

export const metadata: Metadata = {
  title: 'LiteCode - Free, Online IDE',
  icons: '/litecode.svg',
  keywords: 'react, nextjs, typescript, javascript, online, ide, code, editor',
  description: 'LiteCode is a browser-based IDE for React app development.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<Loading />}>
          <div id="root">{children}</div>
        </Suspense>
      </body>
    </html>
  );
}
