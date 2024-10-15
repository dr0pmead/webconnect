export const HighlightText = ({ text, highlight = '' }) => {
    if (!highlight || highlight.trim() === '') {
      return <span>{text}</span>; // Возвращаем текст без изменений, если нет поискового запроса
    }
  
    // Создаем регулярное выражение для поиска текста, игнорируя регистр
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex); // Разбиваем строку на части
  
    return (
      <span>
        {parts.map((part, index) => {
          const isMatch = regex.test(part); // Проверяем, совпадает ли часть с запросом
  
          return isMatch ? ( // Если часть совпадает с поисковым запросом
            <span key={index} style={{ backgroundColor: '#FFDE5A' }}>
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span> // Иначе отображаем как обычный текст
          );
        })}
      </span>
    );
  };
  