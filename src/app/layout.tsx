import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Removed incorrect function calls:
// const geistSans = GeistSans({ variable: '--font-geist-sans' });
// const geistMono = GeistMono({ variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'GraphQL Factory',
  description: 'Generate GraphQL schemas and APIs from your data sources.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
