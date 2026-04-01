import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: 'RecordAI',
  description: 'Confirmación de citas por WhatsApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
