/*
 Этот файл определяет одну линию позиций внутри категории меню.
 Он показывает горизонтальную ленту карточек с названием и ценой.
 Человек может прокручивать ленту, выделять карточки и раскрывать подробности позиции прямо внутри карточки.
*/
"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./MenuPage.module.css";
import {
  formatMenuPrice,
  getMenuPriceInfo,
  parseMenuPrice,
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
  // Этот объект дает доступ к корзине, чтобы добавлять выбранные напитки.
  const cart = useContext(CartContext);
  // Этот объект держит доступ к ленте карточек для вычисления центра.
  const gridRef = useRef<HTMLDivElement | null>(null);
  // Это число хранит номер карточки, которая сейчас в центре линии.
  const [activeIndex, setActiveIndex] = useState(0);
  // Этот текст хранит ключ карточки, у которой сейчас раскрыты описание и размеры.
  const [expandedCardKey, setExpandedCardKey] = useState<string | null>(null);
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

  // Эта функция раскрывает или сворачивает дополнительный текст внутри выбранной карточки.
  const handleDetailsToggle = (cardKey: string, index: number) => {
    handleCardFocus(index);
    setExpandedCardKey((previousKey) =>
      previousKey === cardKey ? null : cardKey
    );
  };

  // Эта функция срабатывает по кнопке «Добавить» и кладет выбранный напиток в корзину.
  const handleAddItemClick = (params: {
    id: string;
    name: string;
    price: number | null;
    index: number;
  }) => {
    handleCardFocus(params.index);
    cart.addItem({
      id: params.id,
      name: params.name,
      price: params.price,
    });
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
          const cardKey = String(item.id ?? `${categoryKey}-${index}`);
          const detailsPanelId = `menu-card-details-${categoryKey}-${index}`;
          const description = item.description?.trim() ?? "";
          const priceInfo = getMenuPriceInfo(item);
          const rawPrice = priceInfo.rawPrice;
          const hasDescription = description.length > 0;
          const hasVariants = priceInfo.variants.length > 0;
          const hasExtraDetails = hasDescription || hasVariants;
          const isExpanded = hasExtraDetails && expandedCardKey === cardKey;
          const addPrice = Number.isFinite(rawPrice)
            ? rawPrice
            : Number.isFinite(priceInfo.minVariantPrice)
              ? priceInfo.minVariantPrice
              : null;
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
          const cardDetailsClassName = isExpanded
            ? `${styles.cardDetails} ${styles.cardDetailsExpanded}`
            : styles.cardDetails;
          const detailsContentClassName = isExpanded
            ? `${styles.detailsContent} ${styles.detailsContentExpanded}`
            : styles.detailsContent;
          // Этот блок собирает содержимое карточки позиции.
          return (
            // Этот блок показывает одну карточку в линии и не уводит человека на отдельную страницу.
            <div
              key={cardKey}
              className={cardLinkClassName}
              data-menu-card="true"
              aria-label={`Позиция ${nameLabel}`}
              onFocusCapture={() => handleCardFocus(index)}
            >
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
                {/* Этот блок показывает текст карточки поверх фото с блюром, чтобы текст было легче читать. */}
                <div className={cardDetailsClassName}>
                  {/* Этот блок показывает заголовок «Популярно», если позиция отмечена. */}
                  {isPopular ? (
                    <p className={styles.popularText}>{text.popularLabel}</p>
                  ) : null}
                  {/* Этот блок выводит название и цену на одной линии. */}
                  <div className={styles.namePriceRow}>
                    <h3 className={styles.name}>{nameLabel}</h3>
                    <p className={styles.price}>{priceLabel}</p>
                  </div>
                  {/* Этот блок показывает действия для карточки: раскрыть подробности и добавить позицию. */}
                  <div className={styles.cardActions}>
                    {hasExtraDetails ? (
                      <button
                        type="button"
                        className={styles.detailsButton}
                        aria-expanded={isExpanded}
                        aria-controls={detailsPanelId}
                        onClick={() => handleDetailsToggle(cardKey, index)}
                      >
                        <span className={styles.detailsLabel}>
                          {isExpanded ? text.hideDetailsLabel : text.detailsLabel}
                        </span>
                      </button>
                    ) : (
                      <p className={styles.detailsLabel} aria-hidden="true">
                        &nbsp;
                      </p>
                    )}
                    <button
                      type="button"
                      className={styles.addButton}
                      aria-label={`Добавить в корзину: ${nameLabel}`}
                      onClick={() =>
                        handleAddItemClick({
                          id: cardKey,
                          name: nameLabel,
                          price: addPrice,
                          index,
                        })
                      }
                    >
                      <span className={styles.addButtonLabel}>{text.addLabel}</span>
                    </button>
                  </div>
                  {/* Этот блок показывает описание и размеры стаканов после нажатия «Подробнее». */}
                  {hasExtraDetails ? (
                    <div
                      id={detailsPanelId}
                      className={detailsContentClassName}
                      aria-hidden={!isExpanded}
                    >
                      {hasDescription ? (
                        <div className={styles.detailsSection}>
                          <p className={styles.detailsSectionTitle}>
                            {text.descriptionTitle}
                          </p>
                          <p className={styles.detailsDescription}>{description}</p>
                        </div>
                      ) : null}
                      {hasVariants ? (
                        <div className={styles.detailsSection}>
                          <p className={styles.detailsSectionTitle}>
                            {text.variantsTitle}
                          </p>
                          <ul
                            className={styles.detailsVariants}
                            aria-label={text.variantsTitle}
                          >
                            {priceInfo.variants.map((variant, variantIndex) => {
                              const sizeLabel =
                                variant?.sizeName?.toString().trim() ||
                                text.sizeFallback;
                              const mlLabel = Number.isFinite(variant?.ml)
                                ? `${variant.ml} мл`
                                : null;
                              const variantPrice = parseMenuPrice(variant?.price);
                              const variantPriceLabel = Number.isFinite(
                                variantPrice
                              )
                                ? formatMenuPrice(variantPrice)
                                : text.priceFallback;

                              return (
                                <li
                                  key={`${cardKey}-variant-${variantIndex}`}
                                  className={styles.detailsVariant}
                                >
                                  <span className={styles.detailsVariantSize}>
                                    {sizeLabel}
                                    {mlLabel ? (
                                      <span className={styles.detailsVariantMl}>
                                        {" "}
                                        · {mlLabel}
                                      </span>
                                    ) : null}
                                  </span>
                                  <span className={styles.detailsVariantPrice}>
                                    {variantPriceLabel}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
