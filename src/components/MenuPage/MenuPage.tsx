/*
 Этот файл определяет страницу полного меню.
 Он показывает карточки с названием, категорией и ценой, а центральная карточка выделена.
 Человек может пролистывать меню, видеть выбранную карточку в центре и открыть подробную страницу позиции.
*/
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./MenuPage.module.css";
import {
  formatMenuPrice,
  getMenuPriceInfo,
  type MenuItem,
} from "@/lib/menuData";
import { commonMenuText } from "@/lib/menuText";

type MenuPageProps = {
  items: MenuItem[];
};

// Этот набор текста хранит заголовок и подсказки для страницы меню.
const menuPageText = {
  title: "Полное меню",
  empty: "Пока нет данных о меню. Загляните чуть позже!",
  priceFromPrefix: "от",
  ...commonMenuText,
};

// Этот список связывает название позиции с видеофоном на карточке.
const menuVideoByName = [{ key: "эспрессо", src: "/espresso.mp4" }];

// Этот помощник подбирает видеофон по названию позиции меню.
function getMenuVideoSrc(nameLabel: string) {
  const lowerName = nameLabel.trim().toLowerCase();
  const match = menuVideoByName.find((item) => lowerName.includes(item.key));
  return match?.src ?? null;
}

// Этот компонент показывает список позиций меню в виде карточек.
export default function MenuPage({ items }: MenuPageProps) {
  // Этот объект держит доступ к ленте карточек для вычисления центра.
  const gridRef = useRef<HTMLDivElement | null>(null);
  // Это число хранит номер карточки, которая сейчас в центре.
  const [activeIndex, setActiveIndex] = useState(0);
  // Этот ключ хранит название записи для позиции прокрутки ленты.
  const scrollStorageKey = "menu-page-scroll-left";

  // Эта функция мягко перемещает нужную карточку в центр ленты.
  const scrollCardToCenter = (
    index: number,
    behavior: ScrollBehavior = "smooth"
  ) => {
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
  };

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
  }, [items.length]);

  // Эта функция выделяет карточку при выборе и сдвигает ее в центр.
  const handleCardFocus = (index: number) => {
    setActiveIndex(index);
    scrollCardToCenter(index);
  };

  return (
    // Этот блок содержит всю страницу меню и ее заголовок.
    <section className={styles.menuPage} aria-label="Полное меню">
      <div className={styles.container}>
        {/* Этот блок показывает заголовок страницы. */}
        <div className={styles.header}>
          <h1 className={styles.title}>{menuPageText.title}</h1>
        </div>

        {/* Этот блок показывает горизонтальную ленту карточек с выделением центральной позиции или сообщение об отсутствии данных. */}
        {items.length === 0 ? (
          <p className={styles.empty}>{menuPageText.empty}</p>
        ) : (
          <>
            {/* Этот блок растягивает ленту на всю ширину и оставляет место для теней. */}
            <div className={styles.gridWrap}>
              <div className={styles.grid} ref={gridRef}>
                {items.map((item, index) => {
                  // Этот блок готовит текст карточки и цену позиции.
                  const nameLabel =
                    item.name?.trim() || menuPageText.nameFallback;
                  const categoryLabel =
                    typeof item.category === "object" && item.category?.value
                      ? item.category.value
                      : menuPageText.categoryFallback;
                  const priceInfo = getMenuPriceInfo(item);
                  const priceLabel = Number.isFinite(priceInfo.rawPrice)
                    ? formatMenuPrice(priceInfo.rawPrice)
                    : priceInfo.hasVariantPrices
                    ? `${menuPageText.priceFromPrefix} ${formatMenuPrice(
                        priceInfo.minVariantPrice
                      )}`
                    : menuPageText.priceFallback;
                  const isPopular = Boolean(item.popular);
                  // Этот блок определяет, нужен ли фон-видео для карточки позиции.
                  const videoSrc = getMenuVideoSrc(nameLabel);
                  const isSelected = index === activeIndex;
                  const cardBaseClassName = videoSrc
                    ? `${styles.card} ${styles.cardWithVideo}`
                    : styles.card;
                  const cardClassName = isSelected
                    ? `${cardBaseClassName} ${styles.cardSelected}`
                    : `${cardBaseClassName} ${styles.cardBlurred}`;
                  const cardLinkClassName = isSelected
                    ? `${styles.cardLink} ${styles.cardLinkSelected}`
                    : `${styles.cardLink} ${styles.cardLinkBlurred}`;

                  return (
                    // Этот блок делает карточку кликабельной и ведет к странице позиции.
                    <Link
                      key={item.id ?? `${nameLabel}-${index}`}
                      className={cardLinkClassName}
                      href={`/menu/${item.id}`}
                      aria-label={`Открыть позицию ${nameLabel}`}
                      data-menu-card="true"
                      onFocus={() => handleCardFocus(index)}
                    >
                      <article className={cardClassName}>
                        {/* Этот блок показывает видеофон, если он есть у позиции. */}
                        {videoSrc ? (
                          <div className={styles.videoWrap} aria-hidden="true">
                            <video
                              className={styles.video}
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="metadata"
                            >
                              <source src={videoSrc} type="video/mp4" />
                            </video>
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
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
