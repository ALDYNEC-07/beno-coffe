// Этот файл обслуживает запрос /api/menu и отдает меню из Baserow.
import { fetchBaserowTable, getBaserowEnv } from "@/lib/baserow";

// Этот обработчик проверяет настройки, загружает меню и возвращает JSON.
export async function GET() {
  // Этот блок собирает настройки доступа к Baserow и проверяет их наличие.
  const { values, missing } = getBaserowEnv([
    "BASEROW_API_URL",
    "BASEROW_TABLE_ID",
    "BASEROW_TOKEN",
  ]);

  if (missing.length > 0) {
    return Response.json(
      { error: "Missing Baserow configuration", missing },
      { status: 500 }
    );
  }

  // Этот блок запрашивает таблицу меню и получает ответ Baserow.
  const response = await fetchBaserowTable({
    baseUrl: values.BASEROW_API_URL,
    tableId: values.BASEROW_TABLE_ID,
    token: values.BASEROW_TOKEN,
  });

  if (!response.ok) {
    // Если Baserow вернул ошибку, отдаем понятный ответ с кодом 500.
    return Response.json(
      { error: "Baserow request failed", status: response.status },
      { status: 500 }
    );
  }

  // Этот блок отдает данные меню как есть, чтобы фронт мог их использовать.
  return Response.json(response.data);
}
