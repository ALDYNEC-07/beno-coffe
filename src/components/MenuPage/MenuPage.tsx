/*
 Этот файл определяет страницу полного меню.
 Он показывает минимальные карточки с названием, категорией и ценой.
 Человек может быстро просмотреть меню и открыть подробную страницу позиции.
*/
import Link from "next/link";
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

        {/* Этот блок показывает горизонтальную ленту карточек или сообщение об отсутствии данных. */}
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

              return (
                // Этот блок делает карточку кликабельной и ведет к странице позиции.
                <Link
                  key={item.id ?? `${nameLabel}-${index}`}
                  className={styles.cardLink}
                  href={`/menu/${item.id}`}
                  aria-label={`Открыть позицию ${nameLabel}`}
                >
                  <article className={styles.card}>
                    {/* Этот блок показывает минимальную информацию о позиции. */}
                    <div className={styles.cardHeader}>
                      <div className={styles.nameBlock}>
                        <div className={styles.nameRow}>
                          <h2 className={styles.name}>{nameLabel}</h2>
                          {isPopular ? (
                            <span className={styles.badge} aria-label="Популярная позиция">
                              ⭐ {menuPageText.popularLabel}
                            </span>
                          ) : null}
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
        )}
      </div>
    </section>
  );
}
