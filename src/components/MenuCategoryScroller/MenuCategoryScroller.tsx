/*
 Этот файл определяет верхний скролл категорий для меню.
 Он показывает горизонтальный список категорий и выделяет выбранную.
 Человек может выбрать нужную категорию и быстро перейти к ее линии позиций.
*/
"use client";
import { useEffect, useRef, useState } from "react";
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
  // Эта переменная хранит состояние, раскрыт ли список категорий.
  const [isExpanded, setIsExpanded] = useState(false);

  // Эта функция мягко двигает ленту категорий по горизонтали и не трогает прокрутку страницы.
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

    const scrollerStyles = window.getComputedStyle(scroller);
    const paddingLeft = parseFloat(scrollerStyles.paddingLeft) || 0;
    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    const targetCenter = target.offsetLeft + target.offsetWidth / 2;
    const nextLeft =
      inline === "start"
        ? target.offsetLeft - paddingLeft
        : targetCenter - scroller.clientWidth / 2;
    const clampedLeft = Math.max(0, Math.min(maxScrollLeft, nextLeft));

    scroller.scrollTo({
      left: clampedLeft,
      behavior,
    });
  };

  // Этот блок выставляет стартовую позицию категорий слева без прокрутки страницы.
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

  // Эта функция переключает панель категорий между свернутым и раскрытым состоянием.
  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <>
      {/* Этот контейнер управляет шириной и анимацией списка категорий вместе с кнопкой стрелки. */}
      <div
        className={styles.scrollerContainer}
        data-expanded={isExpanded ? "true" : "false"}
      >
        {/* Этот блок показывает горизонтальный список категорий. */}
        <div
          className={styles.scroller}
          data-expanded={isExpanded ? "true" : "false"}
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
        {/* Эта кнопка с стрелкой раскрывает или закрывает весь список категорий. */}
        <button
          type="button"
          className={styles.toggleButton}
          data-expanded={isExpanded ? "true" : "false"}
          onClick={toggleExpanded}
          aria-pressed={isExpanded}
          aria-label={
            isExpanded ? "Свернуть категории" : "Показать все категории"
          }
        >
          <span className={styles.arrowChar} aria-hidden="true">
            ➤
          </span>
        </button>
      </div>
    </>
  );
}
