/**
 * Преобразует строку с запятой в качестве разделителя в float
 * Обрабатывает случаи: "89,7" -> 89.7, "-" -> null, "" -> null
 * @param value - строка для преобразования
 * @returns число или null, если значение невалидно
 */
function parseFloatFromString(value: string | null | undefined): number | null {
  if (!value || value.trim() === "" || value === "-") {
    return null;
  }
  
  // Заменяем запятую на точку для корректного парсинга
  const normalizedValue = value.replace(",", ".");
  const parsed = parseFloat(normalizedValue);
  
  // Проверяем, что результат валидное число
  if (isNaN(parsed)) {
    return null;
  }
  
  return parsed;
}

export default parseFloatFromString;