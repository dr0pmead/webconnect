// pages/_app.js
import Header from '@/components/Header';
import '@/styles/globals.css';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/AuthLayout';
import { UserProvider } from '@/components/UserContext'; 
import { ToastContainer } from 'react-toastify'; // Импортируем ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Импортируем стили Toastify
import Head from 'next/head';
import {NextUIProvider} from "@nextui-org/react";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Определяем, нужно ли скрыть Header для страницы логина
  const showHeader = router.pathname !== '/login';

  return (
    <NextUIProvider>
    <AuthLayout>
      <UserProvider>
        <ToastContainer // Добавляем ToastContainer для алертов
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored" // Можно указать темную или светлую тему, по вашему желанию
        />
        {showHeader && <Header />}
        <Head>
        <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
        </Head>
        <Component {...pageProps} />
      </UserProvider>
    </AuthLayout>
    </NextUIProvider>
  );
}

export default MyApp;
