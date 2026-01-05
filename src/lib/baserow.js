// Этот файл хранит общие функции для серверных запросов к Baserow.
// Здесь проверяются настройки, собираются адреса таблиц и выполняются запросы.
// Эта константа хранит общий кусок пути к таблицам Baserow.
const TABLE_PATH = "/api/database/rows/table/";

// Эта функция приводит базовый адрес к аккуратному виду без лишних слэшей.
function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) {
    return "";
  }
  return baseUrl.replace(/\/+$/, "");
}

// Эта функция читает нужные переменные окружения и сообщает, чего не хватает.
export function getBaserowEnv(requiredKeys) {
  const values = {};
  const missing = [];

  requiredKeys.forEach((key) => {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      values[key] = value;
    }
  });

  return { values, missing };
}

// Эта функция собирает полный адрес для конкретной таблицы Baserow.
export function buildBaserowTableUrl(baseUrl, tableId) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  return `${normalizedBaseUrl}${TABLE_PATH}${tableId}/?user_field_names=true`;
}

// Эта функция делает запрос к таблице Baserow и возвращает данные или код ошибки.
export async function fetchBaserowTable({ baseUrl, tableId, token }) {
  const url = buildBaserowTableUrl(baseUrl, tableId);
  const res = await fetch(url, {
    headers: { Authorization: `Token ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return { ok: false, status: res.status };
  }

  const data = await res.json();
  return { ok: true, data };
}
