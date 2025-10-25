import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';  // Adjust path if needed

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Universal Prediction Market',
  description: 'Cross-chain prediction markets on Push Chain',
  icons: {
    icon: '\alter.ico',
    shortcut: '\alter.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
            <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}