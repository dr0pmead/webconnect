import { useUser } from '@/components/UserContext';
import Head from 'next/head';
export default function UsersPage() {
  const user = useUser();

  // Проверяем, загружены ли данные пользователя
  if (!user) {
    return <div>Загрузка данных пользователя...</div>;
  }

  return (
    <>
    <Head>
      <title>Управление пользователями - WebConnect</title>
      <meta name="description" content="Добро пожаловать на главную страницу WebConnect" />
    </Head>
    <div className="w-full h-full">
        <div className="max-w-1320 py-8 flex flex-col  mx-auto">
            <div className="text-4xl text-[#343F52] font-semibold">
              Управление пользователями
            </div>  
        </div>
    </div>
    </>

  );
}
