import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ML-Driven Optimization: Transforming Sports Data Entry Workflows',
  description: 'AI Co-Pilot dashboard for Asyalogic & Sportradar operational optimization — real-time anomaly detection, fatigue prediction, HITL system.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
