import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Yann - Professional Home Services',
  description: 'Your trusted partner for professional home services. From cleaning to repairs, we make your life easier.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}