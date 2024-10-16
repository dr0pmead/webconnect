export const HighlightText = ({ text, highlight = '' }) => {
  // Ensure text is a string, handle arrays by joining them into a single string
  const textStr = Array.isArray(text) ? text.join(', ') : String(text);

  if (!highlight || highlight.trim() === '') {
      return <span>{textStr}</span>; // Return text as is if no highlight
  }

  // Create regex for search term
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = textStr.split(regex); // Split text by search term

  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} style={{ backgroundColor: '#FFDE5A' }}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};