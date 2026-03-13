import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gamaliel AI Pastor',
  description: 'Bible-based guidance powered by AI. Ask anything about Scripture, faith, theology, or life decisions.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Gamaliel AI Pastor',
    description: 'Bible-based AI guidance for everyday life.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
