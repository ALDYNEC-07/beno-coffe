/*
 Этот файл определяет верхний скролл категорий для меню.
 Он показывает горизонтальный список категорий и выделяет выбранную.
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
  // Этот объект хранит доступ к ленте категорий для прокрутки.
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  // Этот флаг хранит информацию о том, применялась ли начальная прокрутка.
  const hasInitialScrollRef = useRef(false);

  // Эта функция мягко подводит выбранную категорию к нужному месту в ленте.
  const scrollCategoryIntoView = (
    index: number,
    behavior: ScrollBehavior = "smooth",
    inline: ScrollLogicalPosition = "center"
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
      inline,
    });
  };

  // Этот блок выставляет стартовую позицию категорий слева с комфортным отступом.
  useEffect(() => {
    if (hasInitialScrollRef.current || categories.length === 0) {
      return;
    }
    const activeIndex = categories.findIndex(
      (category) => category.key === activeKey
    );
    if (activeIndex < 0) {
      return;
    }
    scrollCategoryIntoView(activeIndex, "auto", "start");
    hasInitialScrollRef.current = true;
  }, [categories, activeKey]);

  // Эта функция выбирает категорию и сразу делает ее видимой в центре.
  const handleCategoryClick = (categoryKey: string, index: number) => {
    onSelect(categoryKey);
    scrollCategoryIntoView(index);
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
