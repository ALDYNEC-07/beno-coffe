import { fetchBaserowTable, getBaserowEnv } from "@/lib/baserow";
import type { MenuCategory, MenuItem, MenuVariant } from "@/lib/menuData";
import { parseNumericValue } from "@/lib/number";

const BASEROW_ENV_KEYS = [
  "BASEROW_API_URL",
  "BASEROW_TABLE_ID",
  "BASEROW_VARIANTS_TABLE_ID",
  "BASEROW_SIZES_TABLE_ID",
  "BASEROW_TOKEN",
] as const;

type BaserowEnvKey = (typeof BASEROW_ENV_KEYS)[number];
type BaserowEnvValues = Record<BaserowEnvKey, string>;
type BaserowRecord = Record<string, unknown>;
type MenuItemWithVariants = MenuItem & { variants: MenuVariant[] };

// Этот срок хранит, сколько данных меню держать в памяти до обновления.
const MENU_CACHE_TTL_MS = 5 * 60 * 1000;
// Этот срок ограничивает время ожидания ответов от Baserow.
const BASEROW_TIMEOUT_MS = 10000;
// Этот блок хранит последнее успешное меню для резервного ответа.
let cachedMenuData: { data: MenuItemWithVariants[]; updatedAt: number } | null =
  null;

// Этот помощник проверяет, свежий ли кэш меню.
function hasFreshCache() {
  if (!cachedMenuData) {
    return false;
  }
  return Date.now() - cachedMenuData.updatedAt < MENU_CACHE_TTL_MS;
}

// Этот помощник записывает меню в кэш.
function storeMenuCache(data: MenuItemWithVariants[]) {
  cachedMenuData = { data, updatedAt: Date.now() };
}

// Эта функция приводит поле ссылок к списку объектов одного вида.
function normalizeLinks(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(Boolean) as BaserowRecord[];
  }
  if (value && typeof value === "object") {
    return [value as BaserowRecord];
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [{ id: value }];
}

function normalizeTextValue(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return null;
}

function normalizeCategoryValue(value: unknown): MenuCategory | null {
  if (!value) {
    return null;
  }
  if (typeof value === "object") {
    const record = value as BaserowRecord;
    const label =
      normalizeTextValue(record.value) ??
      normalizeTextValue(record.name) ??
      normalizeTextValue(record.label) ??
      normalizeTextValue(record.id);
    return label ? { value: label } : null;
  }
  const label = normalizeTextValue(value);
  return label ? { value: label } : null;
}

function normalizeVariantPrice(value: unknown): MenuVariant["price"] | null {
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }
  return null;
}

function normalizeItemId(value: unknown): MenuItem["id"] {
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }
  return undefined;
}

// Этот обработчик возвращает данные меню вместе с вариантами.
export async function GET() {
  // Этот блок сразу возвращает свежий кэш, чтобы не ждать Baserow.
  if (hasFreshCache() && cachedMenuData) {
    return Response.json(cachedMenuData.data, {
      headers: { "x-menu-cache": "fresh" },
    });
  }

  const { values, missing } = getBaserowEnv(BASEROW_ENV_KEYS);
  if (missing.length > 0) {
    if (cachedMenuData) {
      return Response.json(cachedMenuData.data, {
        headers: {
          "x-menu-cache": "stale",
          "x-menu-error": "missing-env",
        },
      });
    }
    return Response.json(
      { error: "Missing Baserow configuration", missing },
      { status: 500 }
    );
  }

  const baserowValues = values as BaserowEnvValues;

  const [menuRes, variantsRes, sizesRes] = await Promise.all([
    fetchBaserowTable({
      baseUrl: baserowValues.BASEROW_API_URL,
      tableId: baserowValues.BASEROW_TABLE_ID,
      token: baserowValues.BASEROW_TOKEN,
      timeoutMs: BASEROW_TIMEOUT_MS,
    }),
    fetchBaserowTable({
      baseUrl: baserowValues.BASEROW_API_URL,
      tableId: baserowValues.BASEROW_VARIANTS_TABLE_ID,
      token: baserowValues.BASEROW_TOKEN,
      timeoutMs: BASEROW_TIMEOUT_MS,
    }),
    fetchBaserowTable({
      baseUrl: baserowValues.BASEROW_API_URL,
      tableId: baserowValues.BASEROW_SIZES_TABLE_ID,
      token: baserowValues.BASEROW_TOKEN,
      timeoutMs: BASEROW_TIMEOUT_MS,
    }),
  ]);

  if (!menuRes.ok || !variantsRes.ok || !sizesRes.ok) {
    const status = !menuRes.ok
      ? menuRes.status
      : !variantsRes.ok
      ? variantsRes.status
      : sizesRes.status;
    if (cachedMenuData) {
      return Response.json(cachedMenuData.data, {
        headers: {
          "x-menu-cache": "stale",
          "x-menu-error": "baserow-failed",
        },
      });
    }
    return Response.json(
      { error: "Baserow request failed", status },
      { status: 500 }
    );
  }

  const menuItems = Array.isArray(menuRes.data?.results)
    ? (menuRes.data.results as BaserowRecord[])
    : [];
  const variants = Array.isArray(variantsRes.data?.results)
    ? (variantsRes.data.results as BaserowRecord[])
    : [];
  const sizes = Array.isArray(sizesRes.data?.results)
    ? (sizesRes.data.results as BaserowRecord[])
    : [];

  const sizeMlById = new Map(
    sizes.map((size) => {
      const mlValue = parseNumericValue(size?.ml);
      return [String(size?.id), Number.isFinite(mlValue) ? mlValue : null];
    })
  );

  const itemsById = new Map<string, MenuItemWithVariants>();
  const menuWithVariants = menuItems.map((item) => {
    const normalizedId = normalizeItemId(item?.id);
    const mappedItem: MenuItemWithVariants = {
      id: normalizedId,
      name: normalizeTextValue(item?.name),
      category: normalizeCategoryValue(item?.category),
      description: normalizeTextValue(item?.description),
      popular: Boolean(item?.popular),
      variants: [],
    };

    if (normalizedId !== undefined) {
      itemsById.set(String(normalizedId), mappedItem);
    }

    return mappedItem;
  });

  variants.forEach((variant) => {
    const itemLinks = normalizeLinks(variant?.item);
    const sizeLink = normalizeLinks(variant?.size)[0];
    const sizeId = sizeLink?.id ?? null;
    const sizeName = normalizeTextValue(
      sizeLink?.value ?? sizeLink?.name ?? sizeLink?.label ?? sizeLink?.id
    );
    const price = normalizeVariantPrice(variant?.price);
    const ml =
      sizeId !== null && sizeId !== undefined
        ? sizeMlById.get(String(sizeId)) ?? null
        : null;

    itemLinks.forEach((link) => {
      const target = itemsById.get(String(link?.id));
      if (!target) {
        return;
      }
      target.variants.push({ sizeName, ml, price });
    });
  });

  menuWithVariants.forEach((item) => {
    item.variants.sort((a, b) => {
      const aMl = parseNumericValue(a.ml);
      const bMl = parseNumericValue(b.ml);
      const aValid = Number.isFinite(aMl);
      const bValid = Number.isFinite(bMl);
      if (aValid && bValid) {
        return aMl - bMl;
      }
      if (aValid) {
        return -1;
      }
      if (bValid) {
        return 1;
      }
      return 0;
    });
  });

  storeMenuCache(menuWithVariants);

  return Response.json(menuWithVariants);
}
