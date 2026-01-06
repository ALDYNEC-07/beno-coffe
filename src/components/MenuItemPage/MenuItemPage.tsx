/*
 Этот файл определяет страницу отдельной позиции меню.
 Он показывает подробное описание, цены и варианты размера выбранной позиции.
 Человек может посмотреть детали и вернуться обратно к полному меню.
*/
import Link from "next/link";
import styles from "./MenuItemPage.module.css";

type MenuCategory = {
  value?: string | null;
} | null;

type MenuVariant = {
  sizeName?: string | null;
  ml?: number | null;
  price?: number | string | null;
};

type MenuItem = {
  id?: number | string;
  name?: string | null;
  price?: number | null;
  category?: MenuCategory;
  description?: string | null;
  popular?: boolean | null;
  variants?: MenuVariant[] | null;
};

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

// Этот помощник приводит цену к числу, даже если она пришла строкой.
const parsePrice = (value: MenuVariant["price"] | MenuItem["price"]) => {
  if (typeof value === "number") {
    return value;
  }
  const text = String(value ?? "").trim();
  if (!text) {
    return Number.NaN;
  }
  return Number.parseFloat(text.replace(",", "."));
};

// Этот форматтер помогает показывать цены в привычном виде.
const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

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

  const nameLabel = item.name?.trim() || menuItemText.nameFallback;
  const categoryLabel =
    typeof item.category === "object" && item.category?.value
      ? item.category.value
      : menuItemText.categoryFallback;
  const description = item.description?.trim();
  const rawPrice = parsePrice(item.price);
  const variants = Array.isArray(item.variants) ? item.variants : [];
  const variantPrices = variants
    .map((variant) => parsePrice(variant?.price))
    .filter((value): value is number => Number.isFinite(value));
  const hasVariantPrices = variantPrices.length > 0;
  const priceLabel = Number.isFinite(rawPrice)
    ? priceFormatter.format(rawPrice)
    : hasVariantPrices
    ? priceFormatter.format(Math.min(...variantPrices))
    : menuItemText.priceFallback;
  const priceTitle = Number.isFinite(rawPrice)
    ? menuItemText.priceLabel
    : hasVariantPrices
    ? menuItemText.priceFromLabel
    : menuItemText.priceLabel;
  const isPopular = Boolean(item.popular);
  const hasVariants = variants.length > 0;

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
              {variants.map((variant, variantIndex) => {
                const sizeLabel =
                  variant?.sizeName?.toString().trim() ||
                  menuItemText.sizeFallback;
                const variantPrice = parsePrice(variant?.price);
                const variantPriceLabel = Number.isFinite(variantPrice)
                  ? priceFormatter.format(variantPrice)
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
