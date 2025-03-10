// src/app/layout.tsx

import '../../styles/globals.css';

export const metadata = {
  title: 'Gestion des locaux',
  description: 'A visual app for a screen display',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="./flavicon.ico" />
      </head>
      <body className="font-roboto">{children}</body>
    </html>
  );
}
