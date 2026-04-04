"use client";

import { useContext } from "react";
import { VoiceAssistant } from "voice-assistant-ai";
import { CartContext } from "@/components/Cart/CartProvider";
import { localMenu } from "@/lib/localMenu";
import { track } from "@vercel/analytics";

function findMenuItem(itemName: string, variantSize?: string) {
  const name = itemName.toLowerCase().trim();
  const item = localMenu.find(m => m.name?.toLowerCase().includes(name));
  if (!item) return null;
  const variants = item.variants ?? [];
  if (variants.length === 0) return null;
  const variant = variantSize
    ? (variants.find(v => v.sizeName?.toLowerCase().includes(variantSize.toLowerCase())) ?? variants[0])
    : variants[0];
  return { item, variant };
}

interface Props {
  systemPrompt: string;
}

export default function VoiceBaristaClient({ systemPrompt }: Props) {
  const { addItem } = useContext(CartContext);

  return (
    <VoiceAssistant
      apiRoute="/api/gemini-session"
      systemPrompt={systemPrompt}
      voice="Kore"
      lang="ru-RU"
      greeting="Привет! Я голосовой бариста BENO. Чем могу помочь?"
      pages={[
        { name: "Главная",           path: "/",      description: "Главная страница сайта" },
        { name: "Меню",              path: "/",      section: "menu",                    description: "Полное меню кофейни" },
        { name: "Кофе",              path: "/",      section: "menu-category-coffee",    description: "Раздел кофе: капучино, латте, эспрессо и другие кофейные напитки" },
        { name: "Шоколад",           path: "/",      section: "menu-category-chocolate", description: "Горячий шоколад" },
        { name: "Чай",               path: "/",      section: "menu-category-tea",       description: "Раздел чая: айва с персиком, граф орлов, дикая вишня и другие" },
        { name: "Милкшейки",         path: "/",      section: "menu-category-milkshake", description: "Раздел милкшейков: банановый, клубничный, шоколадный и другие" },
        { name: "Фреши",             path: "/",      section: "menu-category-fresh",     description: "Раздел свежевыжатых соков" },
        { name: "Лимонады",          path: "/",      section: "menu-category-lemonade",  description: "Раздел лимонадов и мохито" },
        { name: "Десерты",           path: "/",      section: "menu-category-dessert",   description: "Раздел десертов: круассан и другое" },
        { name: "Контакты",          path: "/",      section: "footer",                  description: "Контактная информация, телефон, соцсети" },
        { name: "О нас",             path: "/about", description: "История и философия кофейни BENO" },
        { name: "Авторские напитки", path: "/about", section: "new",                     description: "Авторские напитки и новинка месяца" },
        { name: "Адрес",             path: "/map",   description: "Адрес кофейни и как добраться" },
      ]}
      tools={[
        {
          name: "add_to_cart",
          description: "Добавляет напиток или десерт в корзину заказа гостя",
          parameters: {
            type: "OBJECT",
            properties: {
              item_name:    { type: "STRING",  description: "Название товара из меню" },
              variant_size: { type: "STRING",  description: "Размер: маленький, средний, большой и т.д." },
              quantity:     { type: "INTEGER", description: "Количество, по умолчанию 1" },
            },
            required: ["item_name"],
          },
        },
      ]}
      onToolCall={(name, args) => {
        if (name === "add_to_cart") {
          const itemName    = args.item_name as string;
          const variantSize = args.variant_size as string | undefined;
          const quantity    = Math.max(1, Math.floor((args.quantity as number) ?? 1));
          const found       = findMenuItem(itemName, variantSize);

          if (found) {
            const { item, variant } = found;
            const price = variant.price !== null && variant.price !== undefined
              ? Number(variant.price)
              : null;
            for (let i = 0; i < quantity; i++) {
              addItem({ id: String(item.id), name: item.name ?? itemName, price });
            }
            track("barista_item_added", { item: item.name ?? itemName, quantity });
            return { success: true, message: `${item.name} добавлен` };
          } else {
            return { success: false, message: `"${itemName}" не найден в меню` };
          }
        }
      }}
      onSessionStart={() => track("barista_session_start")}
      onSessionEnd={(seconds) => track("barista_session_end", { duration_seconds: seconds })}
      labels={{
        idle:       "Бариста",
        connecting: "Подключаюсь...",
        listening:  "Слушаю...",
        speaking:   "Говорю...",
        error:      "Ошибка",
      }}
    />
  );
}
