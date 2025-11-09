
import './globals.css';
import { Toaster } from "@/components/ui/toaster.jsx"
import { AuthProvider } from '@/providers/auth-provider.jsx';

export const metadata = {
  title: 'HostHome',
  description: 'Boost your rental business with HostHome.',
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
