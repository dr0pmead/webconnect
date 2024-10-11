// pages/_app.js
import Header from '@/components/Header';
import '@/styles/globals.css';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/AuthLayout';
import { UserProvider } from '@/components/UserContext'; // Import the UserProvider

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Определяем, нужно ли скрыть Header для страницы логина
  const showHeader = router.pathname !== '/login';

  return (
    <UserProvider> {/* Wrap your app in UserProvider */}
      <AuthLayout>
        {showHeader && <Header />}
        <Component {...pageProps} />
      </AuthLayout>
    </UserProvider>
  );
}

export default MyApp;
