import './globals.css';
import NavbarWrapper from '@/components/NavbarWrapper';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'YANN - Professional Home Services | Trusted & Verified',
  description: 'Book trusted home services with YANN. Get verified professionals for cleaning, cooking, drivers, gardening, and puja services. Available in Gurgaon.',
  keywords: 'home services, maid service, cleaning, cooking, personal driver, puja services, Gurgaon',
  authors: [{ name: 'YANN Technologies Pvt. Ltd.' }],
  creator: 'YANN',
  publisher: 'YANN Technologies Pvt. Ltd.',
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: 'YANN - Professional Home Services',
    description: 'Book trusted home services with verified professionals',
    siteName: 'YANN',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavbarWrapper />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}