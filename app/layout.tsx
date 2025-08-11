import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const rdsSpace = localFont({
  src: '/assets/fonts/rds-space.woff2',
  display: 'swap',
  variable: '--font-rds-space',
});

const rdsDisplay = localFont({
  src: '/assets/fonts/rds.woff2',
  display: 'swap',
  variable: '--font-rds-display',
});

const rdsMono = localFont({
  src: '/assets/fonts/rds-mono.woff2',
  display: 'swap',
  variable: '--font-rds-mono',
});

export const metadata: Metadata = {
  title: 'Deterministic Password Generator',
  description: 'Keyed, deterministic password generator — all client-side, no storage.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rdsSpace.variable} ${rdsDisplay.variable} ${rdsMono.variable}`}>
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}