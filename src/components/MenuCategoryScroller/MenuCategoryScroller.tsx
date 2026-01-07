/*
 Этот файл определяет верхний скролл категорий для меню.
 Он показывает горизонтальный список категорий, центрируя выбранную.
 Человек может выбрать нужную категорию и отфильтровать список позиций.
*/
"use client";
import { useEffect, useRef } from "react";
import styles from "./MenuCategoryScroller.module.css";

type MenuCategoryOption = {
  key: string;
  label: string;
};

type MenuCategoryScrollerProps = {
  categories: MenuCategoryOption[];
  activeKey: string;
  ariaLabel?: string;
  onSelect: (key: string) => void;
};

// Этот компонент показывает список категорий в виде скролла.
export default function MenuCategoryScroller({
  categories,
  activeKey,
  ariaLabel = "Категории меню",
  onSelect,
}: MenuCategoryScrollerProps) {
  // Этот объект хранит доступ к ленте категорий для центрирования.
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Эта функция мягко переносит выбранную категорию в центр ленты.
  const scrollCategoryToCenter = (
    index: number,
    behavior: ScrollBehavior = "smooth"
  ) => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const chips = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-category-chip='true']")
    );
    const target = chips[index];
    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior,
      block: "nearest",
      inline: "center",
    });
  };

  // Этот блок центрирует активную категорию при загрузке и обновлении списка.
  useEffect(() => {
    if (categories.length === 0) {
      return;
    }
    const activeIndex = categories.findIndex(
      (category) => category.key === activeKey
    );
    if (activeIndex < 0) {
      return;
    }
    scrollCategoryToCenter(activeIndex, "auto");
  }, [categories, activeKey]);

  // Эта функция выбирает категорию и сразу делает ее видимой в центре.
  const handleCategoryClick = (categoryKey: string, index: number) => {
    onSelect(categoryKey);
    scrollCategoryToCenter(index);
  };

  return (
    // Этот блок показывает горизонтальный список категорий.
    <div
      className={styles.scroller}
      ref={scrollerRef}
      role="group"
      aria-label={ariaLabel}
    >
      {categories.map((category, index) => {
        const isSelected = category.key === activeKey;
        const chipClassName = isSelected
          ? `${styles.chip} ${styles.chipSelected}`
          : styles.chip;

        return (
          <button
            key={category.key}
            type="button"
            className={chipClassName}
            aria-pressed={isSelected}
            data-category-chip="true"
            onClick={() => handleCategoryClick(category.key, index)}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
