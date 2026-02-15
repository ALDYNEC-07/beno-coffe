"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./MenuPage.module.css";
import {
  formatMenuPrice,
  getMenuPriceInfo,
  type MenuItem,
} from "@/lib/menuData";
import {
  getMenuListPriceLabel,
  getMenuNameLabel,
  getMenuImageSrc,
} from "@/lib/menuView";
import { CartContext } from "@/components/Cart/CartProvider";

type MenuCategoryRowEntry = {
  item: MenuItem;
  categoryLabel: string;
  categoryKey: string;
};

type MenuCategoryRowText = {
  nameFallback: string;
  priceFromPrefix: string;
  priceFallback: string;
  popularLabel: string;
  detailsLabel: string;
  hideDetailsLabel: string;
  addLabel: string;
  descriptionTitle: string;
  variantsTitle: string;
  sizeFallback: string;
  scrollStoragePrefix: string;
};

type MenuCategoryRowProps = {
  entries: MenuCategoryRowEntry[];
  categoryKey: string;
  initialFocusIndex: number | null;
  scrollStoragePrefix: string;
  text: MenuCategoryRowText;
  onItemClick: (item: MenuItem) => void;
};

// Этот компонент показывает горизонтальную линию карточек для одной категории.
export default function MenuCategoryRow({
  entries,
  categoryKey,
  initialFocusIndex,
  scrollStoragePrefix,
  text,
  onItemClick,
}: MenuCategoryRowProps) {
  // Этот объект дает доступ к корзине, чтобы добавлять выбранные напитки.
  const cart = useContext(CartContext);
  // Этот объект держит доступ к ленте карточек для вычисления центра.
  const gridRef = useRef<HTMLDivElement | null>(null);
  // Массив ссылок на карточки для прямого доступа без querySelectorAll
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  // Это число хранит номер карточки, которая сейчас в центре линии.
  const [activeIndex, setActiveIndex] = useState(0);
  // Этот объект хранит индекс карточки из адреса, чтобы один раз прокрутить ее в центр.
  const initialScrollIndexRef = useRef<number | null>(initialFocusIndex);

  // Этот ключ хранит название записи для позиции прокрутки ленты.
  const scrollStorageKey = `${scrollStoragePrefix}-${categoryKey}`;

  // Эта функция мягко перемещает нужную карточку в центр ленты.
  const scrollCardToCenter = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const target = itemsRef.current[index];
      if (!target) {
        return;
      }

      target.scrollIntoView({
        behavior,
        block: "nearest",
        inline: "center",
      });
    },
    []
  );

  // Этот блок восстанавливает позицию ленты и выбирает карточку, которая ближе всего к центру.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return;
    }

    let frameId = 0;
    // Эта функция возвращает ленту к сохраненной позиции, если она есть.
    const restoreScrollPosition = () => {
      try {
        const storedValue = window.sessionStorage.getItem(scrollStorageKey);
        if (!storedValue) {
          grid.scrollLeft = 0;
          return;
        }
        const parsedValue = Number(storedValue);
        if (Number.isFinite(parsedValue)) {
          grid.scrollLeft = parsedValue;
        }
      } catch (e) {
        // Ignore storage access errors
      }
    };

    const updateActiveIndex = () => {
      // Используем refs вместо querySelectorAll
      if (itemsRef.current.length === 0) return;

      const gridRect = grid.getBoundingClientRect();
      const gridCenter = gridRect.left + gridRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      itemsRef.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - gridCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex((previousIndex) =>
        previousIndex === closestIndex ? previousIndex : closestIndex
      );
    };

    const handleScroll = () => {
      if (frameId) {
        return;
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateActiveIndex();
        try {
          window.sessionStorage.setItem(
            scrollStorageKey,
            String(grid.scrollLeft)
          );
        } catch (e) {
          // Ignore
        }
      });
    };

    restoreScrollPosition();
    updateActiveIndex();
    grid.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      grid.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [entries.length, scrollStorageKey]);

  // Этот блок один раз прокручивает ленту к карточке из адресной строки.
  useEffect(() => {
    if (initialScrollIndexRef.current === null || entries.length === 0) {
      return;
    }
    const targetIndex = initialScrollIndexRef.current;
    initialScrollIndexRef.current = null;
    if (targetIndex < 0 || targetIndex >= entries.length) {
      return;
    }
    scrollCardToCenter(targetIndex, "auto");
    setActiveIndex(targetIndex);
  }, [scrollCardToCenter, entries.length]);

  // Эта функция выделяет карточку при выборе и сдвигает ее в центр.
  const handleCardFocus = useCallback((index: number) => {
    setActiveIndex(index);
    scrollCardToCenter(index);
  }, [scrollCardToCenter]);

  const handleCardClick = useCallback((item: MenuItem, index: number) => {
    handleCardFocus(index);
    onItemClick(item);
  }, [handleCardFocus, onItemClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, item: MenuItem, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(item, index);
    }
  }, [handleCardClick]);

  // Этот Set хранит ID кнопок, которые сейчас анимируются ("летят в корзину").
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());

  // Эта функция срабатывает по кнопке «Добавить» и кладет выбранный напиток в корзину.
  const handleAddItemClick = (e: React.MouseEvent, params: {
    id: string;
    name: string;
    price: number | null;
    index: number;
  }) => {
    e.stopPropagation(); // Prevent opening modal
    handleCardFocus(params.index);

    setAnimatingItems((prev) => {
      const next = new Set(prev);
      next.add(params.id);
      return next;
    });

    cart.addItem({
      id: params.id,
      name: params.name,
      price: params.price,
    });

    // Fallback cleanup in case animation end doesn't fire (e.g. reduced motion or CSS change)
    // We keep a timeout just in case, but longer than animation to be safe, 
    // or rely purely on onAnimationEnd. Given "bricolage" feedback, purely event based is better, 
    // but if element is removed from DOM logic might fail. 
    // We will trust onAnimationEnd for now as primary.
  };

  const handleAnimationEnd = (id: string) => {
    setAnimatingItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  // Эта функция переключает режим отображения всех карточек (для десктопа).
  const gridClassName = `${styles.grid} ${styles.gridRow}`;

  return (
    // Этот блок растягивает ленту на всю ширину и оставляет место для теней.
    <div className={styles.gridWrap}>
      <div className={gridClassName} ref={gridRef}>
        {entries.map((entry, index) => {
          const { item, categoryLabel } = entry;
          // Этот блок готовит текст карточки и цену позиции.
          const nameLabel = getMenuNameLabel(item, text.nameFallback);
          const priceLabel = getMenuListPriceLabel(item, text);
          const cardKey = String(item.id ?? `${categoryKey}-${index}`);
          const priceInfo = getMenuPriceInfo(item);
          const rawPrice = priceInfo.rawPrice;

          const addPrice = Number.isFinite(rawPrice)
            ? rawPrice
            : Number.isFinite(priceInfo.minVariantPrice)
              ? priceInfo.minVariantPrice
              : null;
          // Этот блок определяет, нужна ли фотография для карточки позиции.
          const imageSrc = getMenuImageSrc(nameLabel, categoryLabel);
          const isSelected = index === activeIndex;
          const isAnimating = animatingItems.has(cardKey);

          // Этот блок собирает содержимое карточки позиции.
          return (
            // Этот блок показывает одну карточку в линии и не уводит человека на отдельную страницу.
            <div
              key={cardKey}
              ref={(el) => { itemsRef.current[index] = el; }}
              className={`${styles.cardLink} ${isSelected ? styles.cardLinkSelected : ''}`}
              data-menu-card="true"
              role="button"
              tabIndex={0}
              aria-label={`Позиция ${nameLabel}`}
              onFocus={() => handleCardFocus(index)}
              onClick={() => handleCardClick(item, index)}
              onKeyDown={(e) => handleKeyDown(e, item, index)}
            >
              <article className={styles.card}>
                {/* Этот блок показывает фотографию позиции отдельно от текста. */}
                {imageSrc && (
                  <div className={styles.cardVisual}>
                    <Image
                      className={styles.image}
                      src={imageSrc}
                      alt=""
                      fill
                      loading={isSelected ? "eager" : "lazy"}
                      sizes="(max-width: 719px) 40vw, 200px"
                    />
                  </div>
                )}

                <div className={styles.cardDetails}>
                  {/* Этот блок выводит название и цену на одной линии. */}
                  <h3 className={styles.name}>{nameLabel}</h3>

                  {/* Этот блок показывает действия для карточки: раскрыть подробности и добавить позицию. */}
                  <div className={styles.cardFooter}>
                    <p className={styles.price}>{priceLabel}</p>
                    <button
                      type="button"
                      className={`${styles.addButton} ${isAnimating ? styles.addButtonAnimating : ''}`}
                      aria-label={`Добавить в корзину: ${nameLabel}`}
                      onClick={(e) =>
                        handleAddItemClick(e, {
                          id: cardKey,
                          name: nameLabel,
                          price: addPrice,
                          index,
                        })
                      }
                      onAnimationEnd={() => handleAnimationEnd(cardKey)}
                    >
                      <span className={styles.addButtonLabel}>{text.addLabel}</span>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
