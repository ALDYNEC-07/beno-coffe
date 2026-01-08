// Этот файл хранит общие типы меню и помощники для работы с ценами.
// Он помогает не дублировать разбор цены и формат вывода.

import { parseNumericValue } from "@/lib/number";

export type MenuCategory = {
  value?: string | null;
} | null;

export type MenuVariant = {
  sizeName?: string | null;
  ml?: number | null;
  price?: number | string | null;
};

export type MenuItem = {
  id?: number | string;
  name?: string | null;
  price?: number | string | null;
  category?: MenuCategory;
  description?: string | null;
  popular?: boolean | null;
  variants?: MenuVariant[] | null;
};

// Этот помощник приводит цену к числу, даже если она пришла строкой.
export function parseMenuPrice(value: MenuVariant["price"] | MenuItem["price"]) {
  return parseNumericValue(value);
}

// Этот форматтер помогает показывать цены в привычном виде.
const menuPriceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

// Этот помощник форматирует цену для вывода.
export function formatMenuPrice(value: number) {
  return menuPriceFormatter.format(value);
}

// Этот помощник приводит список вариантов к единому виду.
export function getMenuVariants(item: MenuItem | null | undefined) {
  return Array.isArray(item?.variants) ? item.variants : [];
}

// Этот помощник собирает данные о цене позиции и ее вариантах.
export function getMenuPriceInfo(item: MenuItem | null | undefined) {
  const rawPrice = parseMenuPrice(item?.price ?? null);
  const variants = getMenuVariants(item);
  const variantPrices = variants
    .map((variant) => parseMenuPrice(variant?.price))
    .filter((value): value is number => Number.isFinite(value));
  const hasVariantPrices = variantPrices.length > 0;
  const minVariantPrice = hasVariantPrices
    ? Math.min(...variantPrices)
    : Number.NaN;

  return {
    rawPrice,
    variants,
    variantPrices,
    hasVariantPrices,
    minVariantPrice,
  };
}
