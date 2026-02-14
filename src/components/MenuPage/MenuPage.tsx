/*
 Этот файл определяет секцию полного меню.
 Он показывает скролл категорий и отдельные линии позиций для каждой категории.
 Человек может выбрать категорию сверху, пролистывать строки карточек и раскрывать подробности позиции прямо в карточке.
*/
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./MenuPage.module.css";
import type { MenuItem } from "@/lib/menuData";
import { commonMenuText } from "@/lib/menuText";
import {
  getMenuCategoryKey,
  getMenuCategoryLabel,
  getMenuNameLabel,
} from "@/lib/menuView";
import MenuCategoryScroller from "@/components/MenuCategoryScroller/MenuCategoryScroller";
import MenuCategoryRow from "@/components/MenuPage/MenuCategoryRow";

type MenuPageProps = {
  items: MenuItem[];
};

type MenuItemWithCategory = {
  item: MenuItem;
  categoryLabel: string;
  categoryKey: string;
};

type MenuCategorySection = {
  key: string;
  label: string;
  entries: MenuItemWithCategory[];
};

type InitialSelection = {
  categoryKey: string;
  index: number;
} | null;

// Этот набор текста хранит подписи, запасные тексты и служебные ключи для секции меню.
const menuPageText = {
  empty: "Пока нет данных о меню. Загляните чуть позже!",
  priceFromPrefix: "от",
  popularCategoryKey: "popular",
  popularCategoryLabel: "Популярные",
  categoriesLabel: "Категории меню",
  detailsLabel: "Подробнее",
  hideDetailsLabel: "Скрыть",
  descriptionTitle: "Описание",
  variantsTitle: "Размеры стаканов",
  sizeFallback: "Размер не указан",
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
    return null;
  }

  const requestedKey = requestedItemName.toLocaleLowerCase();
  const matchesRequested = (entry: MenuItemWithCategory) =>
    getMenuNameLabel(entry.item, menuPageText.nameFallback)
      .toLocaleLowerCase()
      .trim() === requestedKey;
  const targetEntry = entries.find(matchesRequested);
  if (!targetEntry) {
    return null;
  }

  const categoryKey = targetEntry.categoryKey;
  const filteredEntries = entries.filter(
    (entry) => entry.categoryKey === categoryKey
  );
  const targetIndex = filteredEntries.findIndex(matchesRequested);
  if (targetIndex === -1) {
    return null;
  }

  return {
    categoryKey,
    index: targetIndex,
  };
};

// Этот компонент показывает меню строками карточек для каждой категории.
export default function MenuPage({ items }: MenuPageProps) {
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

  // Этот блок собирает список секций категорий для вывода строк меню.
  const categorySections = useMemo<MenuCategorySection[]>(() => {
    const sections: MenuCategorySection[] = [];
    const sectionMap = new Map<string, MenuCategorySection>();

    itemsWithCategory.forEach((entry) => {
      const { categoryKey, categoryLabel } = entry;
      if (!sectionMap.has(categoryKey)) {
        const section: MenuCategorySection = {
          key: categoryKey,
          label: categoryLabel,
          entries: [],
        };
        sectionMap.set(categoryKey, section);
        sections.push(section);
      }
      sectionMap.get(categoryKey)?.entries.push(entry);
    });

    const popularEntries = itemsWithCategory.filter((entry) =>
      Boolean(entry.item.popular)
    );

    if (popularEntries.length > 0) {
      return [
        {
          key: menuPageText.popularCategoryKey,
          label: menuPageText.popularCategoryLabel,
          entries: popularEntries,
        },
        ...sections,
      ];
    }

    return sections;
  }, [itemsWithCategory]);

  // Этот блок готовит список категорий для верхнего скролла.
  const categories = useMemo(
    () =>
      categorySections.map((section) => ({
        key: section.key,
        label: section.label,
      })),
    [categorySections]
  );

  // Этот объект выбирает стартовую категорию и карточку на основе адреса.
  const initialSelection = getInitialSelection(
    itemsWithCategory,
    requestedItemName
  );

  // Этот ключ выбирает стартовую категорию для верхнего скролла.
  const defaultCategoryKey = categorySections[0]?.key ?? "";

  // Это поле хранит ключ категории, выбранной человеком.
  const [activeCategoryKey, setActiveCategoryKey] = useState(
    () => initialSelection?.categoryKey ?? defaultCategoryKey
  );
  // Этот объект хранит ссылки на секции категорий для прокрутки.
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Этот объект хранит ключ категории, к которой нужно прокрутить страницу один раз.
  const initialScrollKeyRef = useRef(initialSelection?.categoryKey ?? null);

  // Этот ключ выбирает доступную категорию, если прежняя больше не существует.
  const resolvedCategoryKey = categories.some(
    (category) => category.key === activeCategoryKey
  )
    ? activeCategoryKey
    : defaultCategoryKey;

  // Эта функция запоминает секцию категории, чтобы потом к ней прокрутиться.
  const handleCategoryRef = useCallback(
    (categoryKey: string) => (node: HTMLDivElement | null) => {
      categoryRefs.current[categoryKey] = node;
    },
    []
  );

  // Эта функция прокручивает страницу к выбранной категории.
  const scrollToCategory = useCallback(
    (categoryKey: string, behavior: ScrollBehavior = "smooth") => {
      const target = categoryRefs.current[categoryKey];
      if (!target) {
        return;
      }
      target.scrollIntoView({ behavior, block: "start" });
    },
    []
  );

  // Этот блок один раз прокручивает страницу к категории из адресной строки.
  useEffect(() => {
    if (!initialScrollKeyRef.current || categorySections.length === 0) {
      return;
    }
    const targetKey = initialScrollKeyRef.current;
    initialScrollKeyRef.current = null;
    scrollToCategory(targetKey, "auto");
  }, [categorySections.length, scrollToCategory]);

  // Эта функция меняет выбранную категорию в верхнем скролле и прокручивает к ней.
  const handleCategorySelect = (categoryKey: string) => {
    setActiveCategoryKey(categoryKey);
    scrollToCategory(categoryKey);
  };

  return (
    // Этот блок содержит всю секцию меню и верхний выбор категорий.
    <section id="menu" className={styles.menuPage} aria-label="Полное меню">
      <div className="container">
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
        {/* Этот блок показывает линии категорий с карточками или сообщение об отсутствии данных. */}
        {categorySections.length === 0 ? (
          <p className={styles.empty}>{menuPageText.empty}</p>
        ) : (
          // Этот блок собирает строки по категориям и показывает их подряд.
          <div className={styles.categoryList}>
            {categorySections.map((section) => {
              const sectionTitleId = `menu-category-title-${section.key}`;
              const initialIndex =
                initialSelection?.categoryKey === section.key
                  ? initialSelection.index
                  : null;

              return (
                // Этот блок хранит заголовок категории и ее линию карточек.
                <section
                  key={section.key}
                  id={`menu-category-${section.key}`}
                  className={styles.categorySection}
                  aria-labelledby={sectionTitleId}
                  ref={handleCategoryRef(section.key)}
                >
                  <h2 id={sectionTitleId} className={styles.categoryTitle}>
                    {section.label}
                  </h2>
                  <MenuCategoryRow
                    entries={section.entries}
                    categoryKey={section.key}
                    initialFocusIndex={initialIndex}
                    scrollStoragePrefix={menuPageText.scrollStoragePrefix}
                    text={menuPageText}
                  />
                </section>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
