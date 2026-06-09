import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Audyt Marketingowy AI — Novem',
  description: 'Bezpłatny audyt Waszych kampanii wygenerowany przez AI w 90 sekund. Dostarczony przez Novem.',
  openGraph: {
    title: 'Audyt Marketingowy AI — Novem',
    description: 'W 90 sekund pokażemy, gdzie tracicie pieniądze w kampaniach.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
