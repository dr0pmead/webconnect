import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const EquipmentDetailPage = ({ equipmentData }) => {
  const router = useRouter();
  const { name } = router.query;

  // Если данные не загрузились, отображаем сообщение
  if (!equipmentData) {
    return <p>Данные о компьютере не найдены.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Информация о компьютере: {name}</h1>
      <p><strong>Владелец:</strong> {equipmentData.owner}</p>
      <p><strong>Отдел:</strong> {equipmentData.department}</p>
      <p><strong>ОС:</strong> {equipmentData.osVersion}</p>
      <p><strong>Инвентарный номер:</strong> {equipmentData.inventoryNumber}</p>
      
      {/* Выводим остальные данные о компьютере, например, компоненты */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Компоненты:</h2>
        {equipmentData.components && equipmentData.components.map((component, index) => (
          <div key={index}>
            <p><strong>{component.Type}:</strong> {component.Name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Серверный рендеринг для получения данных о ПК на основе параметра name
export async function getServerSideProps({ params }) {
  const { name } = params;
  
  // Выполняем запрос к API для получения информации о ПК
  const res = await fetch(`http://localhost:5000/api/equipments/${name}`);
  const equipmentData = await res.ok ? await res.json() : null;

  // Передаем данные о ПК на страницу или показываем 404, если данных нет
  return {
    props: {
      equipmentData,
    },
    notFound: !equipmentData,
  };
}

export default EquipmentDetailPage;
