// Этот файл проверяет логику работы с ценами и вариантами меню.
// Он нужен, чтобы убедиться: цена разбирается правильно и выводится как ожидалось.
import {
  formatMenuPrice,
  getMenuPriceInfo,
  getMenuVariants,
  parseMenuPrice,
} from "@/lib/menuData";

describe("menuData helpers", () => {
  // Этот блок проверяет, что цена читается из числа и строки.
  test("parseMenuPrice handles numbers and strings", () => {
    expect(parseMenuPrice(120)).toBe(120);
    expect(parseMenuPrice("120,50")).toBeCloseTo(120.5);
  });

  // Этот блок проверяет, что пустая цена дает пустой результат.
  test("parseMenuPrice returns NaN for empty values", () => {
    expect(Number.isNaN(parseMenuPrice(null))).toBe(true);
    expect(Number.isNaN(parseMenuPrice(" "))).toBe(true);
  });

  // Этот блок проверяет формат вывода цены для рубля.
  test("formatMenuPrice matches ru-RU currency format", () => {
    const expected = new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(1200);
    expect(formatMenuPrice(1200)).toBe(expected);
  });

  // Этот блок проверяет, что список вариантов всегда возвращается массивом.
  test("getMenuVariants returns array or empty", () => {
    expect(getMenuVariants(null)).toEqual([]);
    expect(getMenuVariants({ variants: [{ price: 100 }] })).toHaveLength(1);
  });

  // Этот блок проверяет, что основная цена важнее, но варианты тоже учитываются.
  test("getMenuPriceInfo prefers item price but keeps variant info", () => {
    const info = getMenuPriceInfo({
      price: "150",
      variants: [{ price: 180 }, { price: "160" }],
    });

    expect(info.rawPrice).toBe(150);
    expect(info.hasVariantPrices).toBe(true);
    expect(info.minVariantPrice).toBe(160);
  });

  // Этот блок проверяет, что если основной цены нет, берется минимальная из вариантов.
  test("getMenuPriceInfo falls back to variant prices", () => {
    const info = getMenuPriceInfo({
      price: null,
      variants: [{ price: "120" }, { price: "100" }],
    });

    expect(Number.isNaN(info.rawPrice)).toBe(true);
    expect(info.hasVariantPrices).toBe(true);
    expect(info.minVariantPrice).toBe(100);
  });
});
