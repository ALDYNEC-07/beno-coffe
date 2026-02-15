// Этот файл хранит общую загрузку меню для серверных страниц.
// Он берет данные через внутренний API и приводит ответ к единому виду.
import { headers } from "next/headers";
import type { MenuItem } from "@/lib/menuData";

// Эта константа хранит путь к серверному эндпоинту меню.
const MENU_ENDPOINT = "/api/menu-with-variants";
// Этот параметр задает срок кеширования меню, чтобы сократить лишние запросы.
const MENU_REVALIDATE_SECONDS = 300;

// Этот помощник берет первое значение из заголовка, если прокси добавил список через запятую.
function getFirstHeaderValue(value: string | null) {
  if (!value) {
    return null;
  }
  const firstPart = value.split(",")[0]?.trim() ?? "";
  return firstPart.length > 0 ? firstPart : null;
}

// Этот помощник приводит адрес к виду без лишнего слэша на конце.
function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

// Этот помощник проверяет, содержит ли адрес протокол.
function hasProtocol(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

// Этот помощник собирает базовый адрес запроса из заголовков.
async function getMenuBaseUrl() {
  const headerList = await headers();
  const hostFromHeaders =
    getFirstHeaderValue(headerList.get("host")) ??
    getFirstHeaderValue(headerList.get("x-forwarded-host"));
  const hostFromEnv = getFirstHeaderValue(
    process.env.VERCEL_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.SITE_URL ??
      null
  );
  const resolvedHost = hostFromHeaders ?? hostFromEnv;

  if (!resolvedHost) {
    return process.env.NODE_ENV === "production"
      ? null
      : "http://localhost:3000";
  }

  if (hasProtocol(resolvedHost)) {
    return trimTrailingSlash(resolvedHost);
  }

  const protocol =
    getFirstHeaderValue(headerList.get("x-forwarded-proto")) ??
    (resolvedHost.includes("localhost") || resolvedHost.startsWith("127.")
      ? "http"
      : "https");

  return `${protocol}://${trimTrailingSlash(resolvedHost)}`;
}

// Этот помощник делает один запрос меню: из кеша или напрямую без кеша.
async function requestMenu(url: string, forceFresh: boolean) {
  try {
    return await fetch(
      url,
      forceFresh
        ? { cache: "no-store" }
        : { next: { revalidate: MENU_REVALIDATE_SECONDS } }
    );
  } catch {
    return null;
  }
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

// Этот помощник безопасно читает JSON-ответ и превращает его в список меню.
async function parseMenuResponse(response: Response) {
  try {
    const data = await response.json();
    return normalizeMenuResponse(data);
  } catch {
    return null;
  }
}

// Этот помощник загружает полный список меню.
export async function fetchMenuItems() {
  const baseUrl = await getMenuBaseUrl();
  if (!baseUrl) {
    return [];
  }

  const menuUrl = `${baseUrl}${MENU_ENDPOINT}`;

  const cachedResponse = await requestMenu(menuUrl, false);
  if (cachedResponse?.ok) {
    const parsedCachedMenu = await parseMenuResponse(cachedResponse);
    if (parsedCachedMenu) {
      return parsedCachedMenu;
    }
  }

  const freshResponse = await requestMenu(menuUrl, true);
  if (!freshResponse?.ok) {
    return [];
  }

  const parsedFreshMenu = await parseMenuResponse(freshResponse);
  return parsedFreshMenu ?? [];
}
