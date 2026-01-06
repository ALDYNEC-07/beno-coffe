/*
 Этот файл определяет страницу полного меню.
 Он показывает карточки с позициями меню, их ценой, описанием и вариантами размеров.
 Человек может посмотреть состав меню и выбрать интересующие позиции.
*/
import styles from "./MenuPage.module.css";

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

type MenuPageProps = {
  items: MenuItem[];
};

// Этот набор текста хранит заголовок и подсказки для страницы меню.
const menuPageText = {
  title: "Полное меню",
  lead: "Свежие позиции из меню кофейни: напитки, десерты и сезонные предложения.",
  empty: "Пока нет данных о меню. Загляните чуть позже!",
  popularLabel: "Популярно",
  priceFromPrefix: "от",
  priceFallback: "Цена по запросу",
  categoryFallback: "Без категории",
  nameFallback: "Без названия",
  sizeFallback: "Размер не указан",
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

// Этот компонент показывает список позиций меню в виде карточек.
export default function MenuPage({ items }: MenuPageProps) {
  return (
    // Этот блок содержит всю страницу меню и ее заголовок.
    <section className={styles.menuPage} aria-label="Полное меню">
      <div className={styles.container}>
        {/* Этот блок показывает заголовок и описание страницы. */}
        <div className={styles.header}>
          <h1 className={styles.title}>{menuPageText.title}</h1>
          <p className={styles.lead}>{menuPageText.lead}</p>
        </div>

        {/* Этот блок показывает карточки с блюдами или сообщение об отсутствии данных. */}
        {items.length === 0 ? (
          <p className={styles.empty}>{menuPageText.empty}</p>
        ) : (
          <div className={styles.grid}>
            {items.map((item, index) => {
              const nameLabel = item.name?.trim() || menuPageText.nameFallback;
              const categoryLabel =
                typeof item.category === "object" && item.category?.value
                  ? item.category.value
                  : menuPageText.categoryFallback;
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
                ? `${menuPageText.priceFromPrefix} ${priceFormatter.format(
                    Math.min(...variantPrices)
                  )}`
                : menuPageText.priceFallback;
              const isPopular = Boolean(item.popular);
              const hasVariants = variants.length > 0;

              return (
                <article
                  key={item.id ?? `${nameLabel}-${index}`}
                  className={styles.card}
                >
                  {/* Этот блок показывает название, цену и пометку популярности. */}
                  <div className={styles.cardHeader}>
                    <div className={styles.nameBlock}>
                      <h2 className={styles.name}>{nameLabel}</h2>
                      {isPopular ? (
                        <span className={styles.badge} aria-label="Популярная позиция">
                          ⭐ {menuPageText.popularLabel}
                        </span>
                      ) : null}
                    </div>
                    <p className={styles.price}>{priceLabel}</p>
                  </div>

                  {/* Этот блок показывает категорию позиции. */}
                  <p className={styles.category}>{categoryLabel}</p>

                  {/* Этот блок показывает описание, если оно есть. */}
                  {description ? (
                    <p className={styles.description}>{description}</p>
                  ) : null}

                  {/* Этот блок показывает варианты размера и цены в порядке объема. */}
                  {hasVariants ? (
                    <ul
                      className={styles.variants}
                      aria-label="Варианты размера и цены"
                    >
                      {variants.map((variant, variantIndex) => {
                        const sizeLabel =
                          variant?.sizeName?.toString().trim() ||
                          menuPageText.sizeFallback;
                        const variantPrice = parsePrice(variant?.price);
                        const variantPriceLabel = Number.isFinite(variantPrice)
                          ? priceFormatter.format(variantPrice)
                          : menuPageText.priceFallback;
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
                                <span className={styles.variantMl}>
                                  {" "}
                                  · {mlLabel}
                                </span>
                              ) : null}
                            </span>
                            <span className={styles.variantPrice}>
                              {variantPriceLabel}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
