'use client';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/auth/SessionProvider';
import BackForwardRefresh from './BackForwardRefresh';
import ConsoleSignature from './ConsoleSignature';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <BackForwardRefresh />
      <ConsoleSignature />
      {children}
      <Toaster
        position="bottom-right"
        containerStyle={{ bottom: 96 }}
        toastOptions={{
          duration: 2600,
          style: {
            background: '#FFFFFF',
            color: '#2F2D2C',
            border: '1px solid #E5DAC6',
            fontSize: '13px',
            borderRadius: '12px',
          },
        }}
      />
    </SessionProvider>
  );
}
