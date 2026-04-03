import type { MenuItem } from "@/lib/menuData";

const CATEGORY_LABELS: Record<string, string> = {
  Coffee: "☕ Кофе",
  Chocolate: "🍫 Горячий шоколад",
  Tea: "🍵 Чай",
  Milkshake: "🥤 Милкшейки",
  Fresh: "🍊 Фреши",
  Lemonade: "🍋 Лимонады",
  Dessert: "🥐 Десерты",
};

export function serializeMenuForAI(items: MenuItem[]): string {
  const byCategory = new Map<string, MenuItem[]>();

  for (const item of items) {
    const cat = item.category?.value ?? "Прочее";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(item);
  }

  const lines: string[] = [];

  for (const [cat, catItems] of byCategory) {
    const label = CATEGORY_LABELS[cat] ?? cat;
    lines.push(label + ":");

    for (const item of catItems) {
      const name = item.name ?? "Без названия";
      const popular = item.popular ? " ★" : "";

      const variants = item.variants ?? [];
      let priceStr: string;

      if (variants.length === 0) {
        priceStr = "цена по запросу";
      } else if (
        variants.length === 1 &&
        variants[0].sizeName === null
      ) {
        priceStr = `${variants[0].price}₽`;
      } else {
        priceStr = variants
          .map((v) => {
            const ml = v.ml ? ` ${v.ml}мл` : "";
            return `${v.sizeName}${ml} ${v.price}₽`;
          })
          .join(", ");
      }

      lines.push(`  • ${name} — ${priceStr}${popular}`);
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}
