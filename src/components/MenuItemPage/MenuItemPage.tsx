/*
 Этот файл определяет страницу отдельной позиции меню.
 Он показывает подробное описание, цены и варианты размера выбранной позиции, а для некоторых позиций добавляет фотофон.
 Человек может посмотреть детали и вернуться обратно к полному меню.
*/
import Image from "next/image";
import Link from "next/link";
import styles from "./MenuItemPage.module.css";
import {
  formatMenuPrice,
  parseMenuPrice,
  type MenuItem,
} from "@/lib/menuData";
import { commonMenuText } from "@/lib/menuText";
import {
  getMenuCategoryLabel,
  getMenuDetailPriceInfo,
  getMenuNameLabel,
  getMenuImageSrc,
} from "@/lib/menuView";

type MenuItemPageProps = {
  item: MenuItem | null;
};

// Этот набор текста хранит заголовки, подписи и запасные значения.
const menuItemText = {
  ...commonMenuText,
  backLabel: "Вернуться к меню",
  notFoundTitle: "Такой позиции пока нет",
  notFoundLead: "Возможно, она появится чуть позже. Проверьте полное меню.",
  priceLabel: "Цена",
  priceFromLabel: "Цена от",
  sizeFallback: "Размер не указан",
  variantsTitle: "Варианты размера",
  descriptionTitle: "Описание",
};

// Этот компонент показывает подробную карточку выбранной позиции меню с возможным фотофоном.
export default function MenuItemPage({ item }: MenuItemPageProps) {
  // Этот блок держит ссылку для возврата в меню, чтобы не дублировать разметку.
  const backLink = (
    <Link className={styles.backLink} href="/menu">
      ← {menuItemText.backLabel}
    </Link>
  );

  if (!item) {
    return (
      // Этот блок показывает сообщение, если позиция не найдена.
      <section className={styles.menuItemPage} aria-label="Позиция меню">
        <div className={`container ${styles.content}`}>
          {/* Этот блок показывает заголовок и подсказку, что делать дальше. */}
          <div className={styles.header}>
            <h1 className={styles.title}>{menuItemText.notFoundTitle}</h1>
            <p className={styles.lead}>{menuItemText.notFoundLead}</p>
          </div>

          {/* Этот блок ведет пользователя обратно к полному меню. */}
          {backLink}
        </div>
      </section>
    );
  }

  // Этот блок готовит основные данные позиции для отображения.
  const nameLabel = getMenuNameLabel(item, menuItemText.nameFallback);
  const categoryLabel = getMenuCategoryLabel(
    item,
    menuItemText.categoryFallback
  );
  const description = item.description?.trim();
  // Этот блок определяет, нужна ли фоновая фотография для всей страницы позиции.
  const imageSrc = getMenuImageSrc(nameLabel, categoryLabel);
  const pageClassName = imageSrc
    ? `${styles.menuItemPage} ${styles.menuItemPageWithImage}`
    : styles.menuItemPage;
  const contentClassName = imageSrc
    ? `${styles.content} ${styles.contentOnImage}`
    : styles.content;

  // Этот блок рассчитывает цену и варианты, чтобы показать их на странице.
  const { priceInfo, priceLabel, priceTitle } = getMenuDetailPriceInfo(
    item,
    menuItemText
  );
  const isPopular = Boolean(item.popular);
  const hasVariants = priceInfo.variants.length > 0;

  return (
    // Этот блок показывает подробную страницу выбранной позиции меню.
    <section className={pageClassName} aria-label={nameLabel}>
      {/* Этот блок показывает фоновую фотографию для всей страницы позиции. */}
      {imageSrc ? (
        <>
          <div className={styles.imageWrap} aria-hidden="true">
            <Image
              className={styles.image}
              src={imageSrc}
              alt=""
              fill
              priority
              sizes="100vw"
            />
          </div>
          {/* Этот блок смягчает фотофон, чтобы текст читался поверх него. */}
          <div className={styles.imageScrim} aria-hidden="true" />
        </>
      ) : null}
      <div className={`container ${contentClassName}`}>
        {/* Этот блок ведет пользователя обратно к полному меню. */}
        {backLink}

        {/* Этот блок показывает название, категорию и статус популярности. */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{nameLabel}</h1>
            {isPopular ? (
              <span className={styles.badge} aria-label="Популярная позиция">
                {menuItemText.popularLabel}
              </span>
            ) : null}
          </div>
          <p className={styles.category}>{categoryLabel}</p>
        </div>

        {/* Этот блок показывает цену выбранной позиции. */}
        <div className={styles.priceRow}>
          <span className={styles.priceTitle}>{priceTitle}</span>
          <span className={styles.priceValue}>{priceLabel}</span>
        </div>

        {/* Этот блок показывает описание позиции, если оно есть. */}
        {description ? (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{menuItemText.descriptionTitle}</h2>
            <p className={styles.description}>{description}</p>
          </div>
        ) : null}

        {/* Этот блок показывает список вариантов размера, если они есть. */}
        {hasVariants ? (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{menuItemText.variantsTitle}</h2>
            <ul className={styles.variants} aria-label="Варианты размера и цены">
              {priceInfo.variants.map((variant, variantIndex) => {
                const sizeLabel =
                  variant?.sizeName?.toString().trim() ||
                  menuItemText.sizeFallback;
                const variantPrice = parseMenuPrice(variant?.price);
                const variantPriceLabel = Number.isFinite(variantPrice)
                  ? formatMenuPrice(variantPrice)
                  : menuItemText.priceFallback;
                const mlLabel = Number.isFinite(variant?.ml)
                  ? `${variant.ml} мл`
                  : null;

                return (
                  <li
                    key={`${nameLabel}-${sizeLabel}-${variantIndex}`}
                    className={styles.variantItem}
                  >
                    <span className={styles.variantSize}>
                      {sizeLabel}
                      {mlLabel ? (
                        <span className={styles.variantMl}> · {mlLabel}</span>
                      ) : null}
                    </span>
                    <span className={styles.variantPrice}>
                      {variantPriceLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
