import { localMenu } from "@/lib/localMenu";
import { contactData } from "@/components/shared/contactData";
import { businessData } from "@/components/shared/businessData";
import type { MenuItem, MenuVariant } from "@/lib/menuData";
import VoiceBaristaClient from "./VoiceBaristaClient";

const CATEGORY_LABELS: Record<string, string> = {
  Coffee:     "Кофе",
  Chocolate:  "Шоколад",
  Tea:        "Чай",
  Milkshake:  "Милкшейки",
  Fresh:      "Фреши",
  Lemonade:   "Лимонады",
  Dessert:    "Десерты",
};

function buildMenuText(items: MenuItem[]): string {
  const categories = new Map<string, MenuItem[]>();
  for (const item of items) {
    const cat = item.category?.value ?? "Прочее";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(item);
  }

  const lines: string[] = [];
  for (const [cat, catItems] of categories) {
    lines.push(`\n${CATEGORY_LABELS[cat] ?? cat}:`);
    for (const item of catItems) {
      const variants = (item.variants ?? []) as MenuVariant[];
      if (variants.length === 0) continue;

      if (variants.length === 1) {
        const v = variants[0];
        const price = v.price ? ` — ${v.price}₽` : "";
        const ml = v.ml ? ` ${v.ml}мл` : "";
        lines.push(`  • ${item.name}${ml}${price}`);
      } else {
        lines.push(`  • ${item.name}:`);
        for (const v of variants) {
          const size = v.sizeName ? `${v.sizeName}` : "";
          const price = v.price ? ` — ${v.price}₽` : "";
          const ml = v.ml ? ` ${v.ml}мл` : "";
          lines.push(`      ${size}${ml}${price}`);
        }
      }
    }
  }
  return lines.join("\n");
}

const menuText = buildMenuText(localMenu);
const { addressText, phoneText } = contactData;
const { dailyLabel } = businessData.workingHours;

const SYSTEM_PROMPT = `Ты голосовой бариста кофейни BENO COFFEE.
Помогаешь гостям: выбрать напиток, добавить в корзину, узнать адрес и часы работы, перейти на нужную страницу сайта.
Говори кратко и дружелюбно. Отвечай только на русском языке.
Когда гость называет напиток — добавляй в корзину через функцию add_to_cart.
Когда гость просит убрать или удалить позицию — используй функцию remove_from_cart.
Перед ответами о составе или сумме заказа — вызывай get_cart чтобы узнать актуальное содержимое корзины.

КОФЕЙНЯ:
  Адрес: ${addressText}
  Телефон: ${phoneText}
  Часы работы: ${dailyLabel}

МЕНЮ:${menuText}`;

export default function VoiceBaristaLoader() {
  return <VoiceBaristaClient systemPrompt={SYSTEM_PROMPT} />;
}
