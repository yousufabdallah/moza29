import './globals.css';
import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const cairo = Cairo({ subsets: ['arabic'] });

export const metadata: Metadata = {
  title: 'نظام إدارة الحجوزات',
  description: 'نظام شامل لإدارة الحجوزات مع حفظ البيانات محلياً',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} ${inter.className}`}>{children}</body>
    </html>
  );
}