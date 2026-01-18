/*
 Этот файл определяет одну линию позиций внутри категории меню.
 Он показывает горизонтальную ленту карточек с названием и ценой.
 Человек может прокручивать ленту, выделять карточки и открывать подробности позиции.
*/
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./MenuPage.module.css";
import type { MenuItem } from "@/lib/menuData";
import {
  getMenuListPriceLabel,
  getMenuNameLabel,
  getMenuImageSrc,
} from "@/lib/menuView";

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
};

type MenuCategoryRowProps = {
  entries: MenuCategoryRowEntry[];
  categoryKey: string;
  initialFocusIndex: number | null;
  scrollStoragePrefix: string;
  text: MenuCategoryRowText;
};

// Этот компонент показывает горизонтальную линию карточек для одной категории.
export default function MenuCategoryRow({
  entries,
  categoryKey,
  initialFocusIndex,
  scrollStoragePrefix,
  text,
}: MenuCategoryRowProps) {
  // Этот объект держит доступ к ленте карточек для вычисления центра.
  const gridRef = useRef<HTMLDivElement | null>(null);
  // Это число хранит номер карточки, которая сейчас в центре линии.
  const [activeIndex, setActiveIndex] = useState(0);
  // Этот объект хранит индекс карточки из адреса, чтобы один раз прокрутить ее в центр.
  const initialScrollIndexRef = useRef<number | null>(initialFocusIndex);

  // Этот ключ хранит название записи для позиции прокрутки ленты.
  const scrollStorageKey = `${scrollStoragePrefix}-${categoryKey}`;

  // Эта функция мягко перемещает нужную карточку в центр ленты.
  const scrollCardToCenter = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const grid = gridRef.current;
      if (!grid) {
        return;
      }

      const cards = Array.from(
        grid.querySelectorAll<HTMLElement>("[data-menu-card='true']")
      );
      const target = cards[index];
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
      const storedValue = window.sessionStorage.getItem(scrollStorageKey);
      if (!storedValue) {
        grid.scrollLeft = 0;
        return;
      }
      const parsedValue = Number(storedValue);
      if (!Number.isFinite(parsedValue)) {
        return;
      }
      grid.scrollLeft = parsedValue;
    };

    const updateActiveIndex = () => {
      const cards = Array.from(
        grid.querySelectorAll<HTMLElement>("[data-menu-card='true']")
      );
      if (cards.length === 0) {
        return;
      }

      const gridRect = grid.getBoundingClientRect();
      const gridCenter = gridRect.left + gridRect.width / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
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
        window.sessionStorage.setItem(
          scrollStorageKey,
          String(grid.scrollLeft)
        );
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
  const handleCardFocus = (index: number) => {
    setActiveIndex(index);
    scrollCardToCenter(index);
  };

  return (
    // Этот блок растягивает ленту на всю ширину и оставляет место для теней.
    <div className={styles.gridWrap}>
      <div className={`${styles.grid} ${styles.gridRow}`} ref={gridRef}>
        {entries.map((entry, index) => {
          const { item, categoryLabel } = entry;
          // Этот блок готовит текст карточки и цену позиции.
          const nameLabel = getMenuNameLabel(item, text.nameFallback);
          const priceLabel = getMenuListPriceLabel(item, text);
          const isPopular = Boolean(item.popular);
          // Этот блок определяет, нужна ли фотография для карточки позиции.
          const imageSrc = getMenuImageSrc(nameLabel, categoryLabel);
          const isSelected = index === activeIndex;
          const cardBaseClassName = imageSrc
            ? `${styles.card} ${styles.cardWithImage}`
            : styles.card;
          const cardClassName = isSelected
            ? `${cardBaseClassName} ${styles.cardSelected}`
            : `${cardBaseClassName} ${styles.cardBlurred}`;
          const cardLinkClassName = isSelected
            ? `${styles.cardLink} ${styles.cardLinkSelected}`
            : `${styles.cardLink} ${styles.cardLinkBlurred}`;
          // Этот блок определяет ссылку на подробную страницу, если у позиции есть идентификатор.
          const itemHref =
            item.id !== undefined && item.id !== null ? `/menu/${item.id}` : null;
          // Этот блок собирает содержимое карточки позиции.
          const cardContent = (
            <article className={cardClassName}>
              {/* Этот блок показывает фотографию позиции отдельно от текста. */}
              {imageSrc ? (
                <div className={styles.cardVisual} aria-hidden="true">
                  <Image
                    className={styles.image}
                    src={imageSrc}
                    alt=""
                    fill
                    loading={isSelected ? "eager" : "lazy"}
                    sizes="(max-width: 719px) 67vw, 270px"
                  />
                </div>
              ) : null}
              {/* Этот блок показывает пометку популярной позиции в правом верхнем углу карточки. */}
              {isPopular ? (
                <span className={styles.badge} aria-label="Популярная позиция">
                  {text.popularLabel}
                </span>
              ) : null}
              {/* Этот блок показывает название, ссылку и цену без фоновых вставок. */}
              <div className={styles.cardDetails}>
                <div className={styles.nameBlock}>
                  <div className={styles.nameRow}>
                    <h3 className={styles.name}>{nameLabel}</h3>
                  </div>
                  {itemHref ? (
                    <>
                      {/* Этот блок показывает подпись, что карточка ведет к подробностям. */}
                      <p className={styles.detailsLabel}>{text.detailsLabel}</p>
                    </>
                  ) : null}
                </div>
                <p className={styles.price}>{priceLabel}</p>
              </div>
            </article>
          );

          if (itemHref) {
            return (
              // Этот блок делает карточку кликабельной и ведет к странице позиции.
              <Link
                key={item.id ?? `${nameLabel}-${index}`}
                className={cardLinkClassName}
                href={itemHref}
                aria-label={`Открыть позицию ${nameLabel}`}
                data-menu-card="true"
                onFocus={() => handleCardFocus(index)}
              >
                {cardContent}
              </Link>
            );
          }

          return (
            // Этот блок показывает карточку без перехода, если отдельной страницы нет.
            <div
              key={item.id ?? `${nameLabel}-${index}`}
              className={cardLinkClassName}
              data-menu-card="true"
              aria-label={`Позиция ${nameLabel}`}
              aria-disabled="true"
            >
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
