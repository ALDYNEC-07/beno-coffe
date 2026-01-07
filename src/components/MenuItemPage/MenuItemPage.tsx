/*
 Этот файл определяет страницу отдельной позиции меню.
 Он показывает подробное описание, цены и варианты размера выбранной позиции.
 Человек может посмотреть детали и вернуться обратно к полному меню.
*/
import Link from "next/link";
import styles from "./MenuItemPage.module.css";
import {
  formatMenuPrice,
  getMenuPriceInfo,
  parseMenuPrice,
  type MenuItem,
} from "@/lib/menuData";

type MenuItemPageProps = {
  item: MenuItem | null;
};

// Этот набор текста хранит заголовки, подписи и запасные значения.
const menuItemText = {
  backLabel: "Вернуться к меню",
  notFoundTitle: "Такой позиции пока нет",
  notFoundLead: "Возможно, она появится чуть позже. Проверьте полное меню.",
  priceLabel: "Цена",
  priceFromLabel: "Цена от",
  priceFallback: "Цена по запросу",
  categoryFallback: "Без категории",
  nameFallback: "Без названия",
  sizeFallback: "Размер не указан",
  variantsTitle: "Варианты размера",
  descriptionTitle: "Описание",
  popularLabel: "Популярно",
};

// Этот компонент показывает подробную карточку выбранной позиции меню.
export default function MenuItemPage({ item }: MenuItemPageProps) {
  if (!item) {
    return (
      // Этот блок показывает сообщение, когда позиция не найдена.
      <section className={styles.menuItemPage} aria-label="Позиция меню">
        <div className={styles.container}>
          {/* Этот блок показывает заголовок и подсказку, что делать дальше. */}
          <div className={styles.header}>
            <h1 className={styles.title}>{menuItemText.notFoundTitle}</h1>
            <p className={styles.lead}>{menuItemText.notFoundLead}</p>
          </div>

          {/* Этот блок ведет пользователя обратно к полному меню. */}
          <Link className={styles.backLink} href="/menu">
            ← {menuItemText.backLabel}
          </Link>
        </div>
      </section>
    );
  }

  // Этот блок готовит основные данные позиции для отображения.
  const nameLabel = item.name?.trim() || menuItemText.nameFallback;
  const categoryLabel =
    typeof item.category === "object" && item.category?.value
      ? item.category.value
      : menuItemText.categoryFallback;
  const description = item.description?.trim();

  // Этот блок рассчитывает цену и варианты, чтобы показать их на странице.
  const priceInfo = getMenuPriceInfo(item);
  const priceLabel = Number.isFinite(priceInfo.rawPrice)
    ? formatMenuPrice(priceInfo.rawPrice)
    : priceInfo.hasVariantPrices
    ? formatMenuPrice(priceInfo.minVariantPrice)
    : menuItemText.priceFallback;
  const priceTitle = Number.isFinite(priceInfo.rawPrice)
    ? menuItemText.priceLabel
    : priceInfo.hasVariantPrices
    ? menuItemText.priceFromLabel
    : menuItemText.priceLabel;
  const isPopular = Boolean(item.popular);
  const hasVariants = priceInfo.variants.length > 0;

  return (
    // Этот блок показывает подробную страницу выбранной позиции меню.
    <section className={styles.menuItemPage} aria-label={nameLabel}>
      <div className={styles.container}>
        {/* Этот блок ведет пользователя обратно к полному меню. */}
        <Link className={styles.backLink} href="/menu">
          ← {menuItemText.backLabel}
        </Link>

        {/* Этот блок показывает название, категорию и статус популярности. */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{nameLabel}</h1>
            {isPopular ? (
              <span className={styles.badge} aria-label="Популярная позиция">
                ⭐ {menuItemText.popularLabel}
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
