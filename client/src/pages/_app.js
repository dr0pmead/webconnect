// pages/_app.js
import Header from '@/components/Header';
import '@/styles/globals.css';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/AuthLayout';
import { UserProvider } from '@/components/UserContext'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import { NextUIProvider } from "@nextui-org/react";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Определяем, нужно ли скрыть Header для страницы логина
  const showHeader = router.pathname !== '/login';

  // Определяем, должна ли страница быть без AuthLayout
  const isPublicRoute = router.asPath.startsWith('/equipment/');
  return (
    <NextUIProvider>
      {isPublicRoute ? (
        <>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Head>
            <link rel="shortcut icon" href="/assets/img/favicon.ico" />
          </Head>
          <Component {...pageProps} />
        </>
      ) : (
        <AuthLayout>
          <UserProvider>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
            {showHeader && <Header />}
            <Head>
              <link rel="shortcut icon" href="/assets/img/favicon.ico" />
            </Head>
            <Component {...pageProps} />
          </UserProvider>
        </AuthLayout>
      )}
    </NextUIProvider>
  );
}

export default MyApp;
