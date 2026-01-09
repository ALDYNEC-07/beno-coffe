// Этот файл хранит общую загрузку меню для серверных страниц.
// Он берет данные через внутренний API и приводит ответ к единому виду.
import { headers } from "next/headers";
import type { MenuItem } from "@/lib/menuData";

// Эта константа хранит путь к серверному эндпоинту меню.
const MENU_ENDPOINT = "/api/menu-with-variants";

// Этот помощник собирает базовый адрес запроса из заголовков.
async function getMenuBaseUrl() {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

// Этот помощник приводит ответ сервера к списку позиций меню.
function normalizeMenuResponse(data: unknown) {
  if (Array.isArray(data)) {
    return data as MenuItem[];
  }
  if (data && typeof data === "object") {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) {
      return results as MenuItem[];
    }
  }
  return [];
}

// Этот помощник загружает полный список меню.
export async function fetchMenuItems() {
  const baseUrl = await getMenuBaseUrl();
  const response = await fetch(`${baseUrl}${MENU_ENDPOINT}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return normalizeMenuResponse(data);
}

// Этот помощник находит конкретную позицию меню по ее идентификатору.
export async function fetchMenuItemById(
  itemId: string | number | null | undefined
) {
  const items = await fetchMenuItems();
  const targetId = String(itemId ?? "");

  return items.find((item) => String(item?.id) === targetId) ?? null;
}
