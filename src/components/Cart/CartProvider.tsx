/*
 Этот файл определяет общий источник данных для корзины.
 Он сам ничего не показывает на экране, но хранит выбранные напитки и их количество.
 Человек может добавлять позиции из меню, а шапка сайта получает актуальный счетчик.
*/
"use client";

import { createContext, useEffect, useMemo, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
};

type CartItemInput = {
  id: string;
  name: string;
  price: number | null;
};

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  addItem: (item: CartItemInput) => void;
  increaseItemQuantity: (id: string) => void;
  decreaseItemQuantity: (id: string) => void;
};

const cartStorageKey = "beno-cart-items";

// Эта функция читает сохраненные позиции корзины, когда страница открывается в браузере.
const getInitialCartItems = () => {
  if (typeof window === "undefined") {
    return [] as CartItem[];
  }

  const stored = window.localStorage.getItem(cartStorageKey);
  if (!stored) {
    return [] as CartItem[];
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [] as CartItem[];
    }

    return parsed
      .map((entry) => {
        const id = typeof entry?.id === "string" ? entry.id : "";
        const name = typeof entry?.name === "string" ? entry.name : "";
        const quantity = Number(entry?.quantity);
        const priceValue = Number(entry?.price);
        const price = Number.isFinite(priceValue) ? priceValue : null;
        if (!id || !name || !Number.isFinite(quantity) || quantity <= 0) {
          return null;
        }

        return {
          id,
          name,
          price,
          quantity: Math.floor(quantity),
        };
      })
      .filter((entry): entry is CartItem => entry !== null);
  } catch {
    window.localStorage.removeItem(cartStorageKey);
    return [] as CartItem[];
  }
};

// Этот объект дает доступ к корзине всем компонентам внутри общей обертки.
export const CartContext = createContext<CartContextValue>({
  items: [],
  totalCount: 0,
  addItem: () => {},
  increaseItemQuantity: () => {},
  decreaseItemQuantity: () => {},
});

type CartProviderProps = {
  children: React.ReactNode;
};

// Этот компонент хранит корзину и передает данные всем вложенным частям сайта.
export default function CartProvider({ children }: CartProviderProps) {
  // Этот список хранит все позиции, которые человек добавил в корзину.
  const [items, setItems] = useState<CartItem[]>(getInitialCartItems);

  // Этот блок автоматически сохраняет корзину в память браузера после каждого изменения.
  useEffect(() => {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  }, [items]);

  // Эта функция срабатывает по нажатию кнопки «Добавить» и увеличивает количество выбранной позиции.
  const addItem = (item: CartItemInput) => {
    setItems((previousItems) => {
      const existingItemIndex = previousItems.findIndex(
        (entry) => entry.id === item.id
      );
      if (existingItemIndex === -1) {
        return [...previousItems, { ...item, quantity: 1 }];
      }

      return previousItems.map((entry, index) =>
        index === existingItemIndex
          ? { ...entry, quantity: entry.quantity + 1 }
          : entry
      );
    });
  };

  // Эта функция увеличивает количество позиции в корзине по кнопке «+».
  const increaseItemQuantity = (id: string) => {
    setItems((previousItems) =>
      previousItems.map((entry) =>
        entry.id === id ? { ...entry, quantity: entry.quantity + 1 } : entry
      )
    );
  };

  // Эта функция уменьшает количество позиции по кнопке «−» и убирает позицию, если осталось ноль.
  const decreaseItemQuantity = (id: string) => {
    setItems((previousItems) =>
      previousItems
        .map((entry) =>
          entry.id === id ? { ...entry, quantity: entry.quantity - 1 } : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  // Этот счетчик показывает общее число напитков, которые сейчас лежат в корзине.
  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    // Этот блок передает текущую корзину и действия для нее всем вложенным компонентам.
    <CartContext.Provider
      value={{
        items,
        totalCount,
        addItem,
        increaseItemQuantity,
        decreaseItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
