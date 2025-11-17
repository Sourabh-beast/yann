import './globals.css';
import Navbar from '@/components/Navbar';
import PageLoader from '@/components/PageLoader';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PageLoader />
        <Navbar />
        {children}
      </body>
    </html>
  );
}