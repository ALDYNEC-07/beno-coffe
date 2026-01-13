/*
 Этот файл определяет секцию полного меню.
 Он показывает заголовок секции, скролл категорий и карточки позиций с названием, категорией и ценой, а центральная карточка выделена.
 Человек может выбрать категорию, пролистывать меню, видеть выбранную карточку в центре и открыть подробную страницу позиции.
*/
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./MenuPage.module.css";
import type { MenuItem } from "@/lib/menuData";
import { commonMenuText } from "@/lib/menuText";
import {
  getMenuCategoryKey,
  getMenuCategoryLabel,
  getMenuListPriceLabel,
  getMenuNameLabel,
  getMenuImageSrc,
} from "@/lib/menuView";
import MenuCategoryScroller from "@/components/MenuCategoryScroller/MenuCategoryScroller";

type MenuPageProps = {
  items: MenuItem[];
};

type MenuItemWithCategory = {
  item: MenuItem;
  categoryLabel: string;
  categoryKey: string;
};

type InitialSelection = {
  categoryKey: string;
  index: number;
  scrollIndex: number | null;
};

// Этот набор текста хранит подписи, запасные тексты и служебные ключи для секции меню.
const menuPageText = {
  empty: "Пока нет данных о меню. Загляните чуть позже!",
  priceFromPrefix: "от",
  allCategoryKey: "all",
  allCategoryLabel: "Все",
  categoriesLabel: "Категории меню",
  scrollStoragePrefix: "menu-page-scroll-left",
  itemQueryKey: "item",
  ...commonMenuText,
};

// Эта функция выбирает начальную категорию и карточку, если они указаны в адресе страницы.
const getInitialSelection = (
  entries: MenuItemWithCategory[],
  requestedItemName: string
): InitialSelection => {
  if (!requestedItemName) {
    return {
      categoryKey: menuPageText.allCategoryKey,
      index: 0,
      scrollIndex: null,
    };
  }

  const requestedKey = requestedItemName.toLocaleLowerCase();
  const matchesRequested = (entry: MenuItemWithCategory) =>
    getMenuNameLabel(entry.item, menuPageText.nameFallback)
      .toLocaleLowerCase()
      .trim() === requestedKey;
  const targetEntry = entries.find(matchesRequested);
  if (!targetEntry) {
    return {
      categoryKey: menuPageText.allCategoryKey,
      index: 0,
      scrollIndex: null,
    };
  }

  const categoryKey = targetEntry.categoryKey;
  const filteredEntries =
    categoryKey === menuPageText.allCategoryKey
      ? entries
      : entries.filter((entry) => entry.categoryKey === categoryKey);
  const targetIndex = filteredEntries.findIndex(matchesRequested);
  if (targetIndex === -1) {
    return {
      categoryKey,
      index: 0,
      scrollIndex: null,
    };
  }

  return {
    categoryKey,
    index: targetIndex,
    scrollIndex: targetIndex,
  };
};

// Этот компонент показывает список позиций меню в виде карточек.
export default function MenuPage({ items }: MenuPageProps) {
  // Этот объект держит доступ к ленте карточек для вычисления центра.
  const gridRef = useRef<HTMLDivElement | null>(null);
  // Этот объект читает параметры адресной строки, чтобы найти нужную позицию.
  const searchParams = useSearchParams();
  // Этот текст хранит название позиции из адреса, если оно задано.
  const requestedItemName =
    searchParams.get(menuPageText.itemQueryKey)?.trim() ?? "";

  // Этот блок готовит список позиций вместе с их категориями.
  const itemsWithCategory = useMemo<MenuItemWithCategory[]>(
    () =>
      items.map((item) => {
        const categoryLabel = getMenuCategoryLabel(
          item,
          menuPageText.categoryFallback
        );
        const categoryKey = getMenuCategoryKey(categoryLabel);
        return { item, categoryLabel, categoryKey };
      }),
    [items]
  );

  // Этот блок собирает список категорий для верхнего скролла.
  const categories = useMemo(() => {
    const categoryOptions: { key: string; label: string }[] = [];
    const categoryKeys = new Set<string>();
    itemsWithCategory.forEach((entry) => {
      const { categoryKey: key, categoryLabel: label } = entry;
      if (categoryKeys.has(key)) {
        return;
      }
      categoryKeys.add(key);
      categoryOptions.push({ key, label });
    });

    return [
      {
        key: menuPageText.allCategoryKey,
        label: menuPageText.allCategoryLabel,
      },
      ...categoryOptions,
    ];
  }, [itemsWithCategory]);

  // Этот объект выбирает стартовую категорию и карточку на основе адреса.
  const initialSelection = getInitialSelection(
    itemsWithCategory,
    requestedItemName
  );

  // Это поле хранит ключ категории, выбранной человеком.
  const [activeCategoryKey, setActiveCategoryKey] = useState(
    () => initialSelection.categoryKey
  );
  // Это число хранит номер карточки, которая сейчас в центре.
  const [activeIndex, setActiveIndex] = useState(
    () => initialSelection.index
  );
  // Этот объект хранит индекс карточки из адреса, чтобы один раз прокрутить ее в центр.
  const initialScrollIndexRef = useRef<number | null>(
    initialSelection.scrollIndex
  );

  // Этот ключ выбирает доступную категорию, если прежняя больше не существует.
  const resolvedCategoryKey = categories.some(
    (category) => category.key === activeCategoryKey
  )
    ? activeCategoryKey
    : menuPageText.allCategoryKey;

  // Этот блок оставляет только позиции выбранной категории.
  const visibleItems =
    resolvedCategoryKey === menuPageText.allCategoryKey
      ? itemsWithCategory
      : itemsWithCategory.filter(
          (entry) => entry.categoryKey === resolvedCategoryKey
        );

  // Этот ключ хранит название записи для позиции прокрутки ленты.
  const scrollStorageKey = `${menuPageText.scrollStoragePrefix}-${resolvedCategoryKey}`;

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

  // Этот блок восстанавливает позицию ленты при возвращении и выбирает карточку, которая ближе всего к центру.
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
  }, [visibleItems.length, scrollStorageKey]);

  // Этот блок один раз прокручивает ленту к карточке из адресной строки.
  useEffect(() => {
    if (initialScrollIndexRef.current === null || visibleItems.length === 0) {
      return;
    }
    const targetIndex = initialScrollIndexRef.current;
    initialScrollIndexRef.current = null;
    scrollCardToCenter(targetIndex, "auto");
  }, [scrollCardToCenter, visibleItems.length]);

  // Эта функция выделяет карточку при выборе и сдвигает ее в центр.
  const handleCardFocus = (index: number) => {
    setActiveIndex(index);
    scrollCardToCenter(index);
  };

  // Эта функция меняет выбранную категорию в верхнем скролле.
  const handleCategorySelect = (categoryKey: string) => {
    setActiveCategoryKey(categoryKey);
  };

  return (
    // Этот блок содержит всю секцию меню и верхний выбор категорий.
    <section id="menu" className={styles.menuPage} aria-label="Полное меню">
      <div className="container">
        {/* Этот блок показывает заголовок секции меню. */}
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>BENO — место, куда возвращаются.</h1>
        </div>
        {/* Этот блок показывает верхний скролл категорий, если есть позиции меню. */}
        {items.length > 0 ? (
          <div className={styles.header}>
            <MenuCategoryScroller
              categories={categories}
              activeKey={resolvedCategoryKey}
              onSelect={handleCategorySelect}
              ariaLabel={menuPageText.categoriesLabel}
            />
          </div>
        ) : null}

        {/* Этот блок показывает горизонтальную ленту карточек с выделением центральной позиции или сообщение об отсутствии данных. */}
        {visibleItems.length === 0 ? (
          <p className={styles.empty}>{menuPageText.empty}</p>
        ) : (
          // Этот блок растягивает ленту на всю ширину и оставляет место для теней.
          <div className={styles.gridWrap}>
            <div className={styles.grid} ref={gridRef}>
              {visibleItems.map((entry, index) => {
                const { item, categoryLabel } = entry;
                // Этот блок готовит текст карточки и цену позиции.
                const nameLabel = getMenuNameLabel(
                  item,
                  menuPageText.nameFallback
                );
                const priceLabel = getMenuListPriceLabel(item, menuPageText);
                const isPopular = Boolean(item.popular);
                // Этот блок определяет, нужна ли фоновая фотография для карточки позиции.
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
                  item.id !== undefined && item.id !== null
                    ? `/menu/${item.id}`
                    : null;
                // Этот блок собирает содержимое карточки позиции.
                const cardContent = (
                  <article className={cardClassName}>
                    {/* Этот блок показывает фоновую фотографию для карточки позиции. */}
                    {imageSrc ? (
                      <div className={styles.imageWrap} aria-hidden="true">
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
                      <span
                        className={styles.badge}
                        aria-label="Популярная позиция"
                      >
                        {menuPageText.popularLabel}
                      </span>
                    ) : null}
                    {/* Этот блок показывает минимальную информацию о позиции внизу карточки. */}
                    <div className={styles.cardHeader}>
                      <div className={styles.nameBlock}>
                        <div className={styles.nameRow}>
                          <h2 className={styles.name}>{nameLabel}</h2>
                        </div>
                        <p className={styles.category}>{categoryLabel}</p>
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
        )}
      </div>
    </section>
  );
}
