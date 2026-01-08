// Этот файл хранит общий помощник для разбора чисел из строк и значений.
// Он приводит цену или объем к числу и возвращает NaN, если значение некорректное.

// Этот помощник читает число из строки или значения и приводит его к числу.
export function parseNumericValue(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }
  const text = String(value ?? "").trim();
  if (!text) {
    return Number.NaN;
  }
  const parsed = Number.parseFloat(text.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}
