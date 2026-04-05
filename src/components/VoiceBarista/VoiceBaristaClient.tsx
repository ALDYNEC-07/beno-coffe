"use client";

import { useContext, useEffect, useState } from "react";
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
  const { addItem, items, decreaseItemQuantity } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const burger = document.querySelector<HTMLElement>('[aria-controls="nav-panel"]');
    if (!burger) return;

    const update = () => setMenuOpen(burger.getAttribute("aria-expanded") === "true");
    const observer = new MutationObserver(update);
    observer.observe(burger, { attributes: true, attributeFilter: ["aria-expanded"] });
    return () => observer.disconnect();
  }, []);

  return (
    <VoiceAssistant
      apiRoute="/api/gemini-session"
      systemPrompt={systemPrompt}
      voice="Kore"
      lang="ru-RU"
      hidden={menuOpen}
      memory
      greeting="Привет! Я голосовой бариста BENO. Чем могу помочь?"
      hints={[
        "Что у вас популярное?",
        "Добавь капучино в корзину",
        "Покажи лимонады",
      ]}
      borderRadius="1.5rem"
      colors={{
        background: "#1b1b1b",
        text:       "#fff",
        glow:       "212, 160, 100",
      }}
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
        {
          name: "get_cart",
          description: "Возвращает текущее содержимое корзины гостя",
          parameters: {
            type: "OBJECT",
            properties: {},
          },
        },
        {
          name: "remove_from_cart",
          description: "Убирает напиток или десерт из корзины заказа гостя",
          parameters: {
            type: "OBJECT",
            properties: {
              item_name: { type: "STRING",  description: "Название товара из меню" },
              quantity:  { type: "INTEGER", description: "Количество для удаления. Если не указано — убирает все" },
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

        if (name === "get_cart") {
          if (items.length === 0) return { success: true, cart: "Корзина пуста" };
          const contents = items
            .map(i => `${i.name}${i.price ? ` ${i.price}₽` : ""} × ${i.quantity}`)
            .join(", ");
          const total = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
          return { success: true, cart: contents, total: `${total}₽` };
        }

        if (name === "remove_from_cart") {
          const itemName = args.item_name as string;
          const found    = findMenuItem(itemName);
          if (!found) return { success: false, message: `"${itemName}" не найден в меню` };

          const cartItem = items.find(i => i.id === String(found.item.id));
          if (!cartItem) return { success: false, message: `${found.item.name} нет в корзине` };

          const qty = args.quantity
            ? Math.min(Math.max(1, Math.floor(args.quantity as number)), cartItem.quantity)
            : cartItem.quantity;

          for (let i = 0; i < qty; i++) decreaseItemQuantity(String(found.item.id));

          track("barista_item_removed", { item: found.item.name ?? itemName, quantity: qty });
          return { success: true, message: `${found.item.name} убран` };
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
