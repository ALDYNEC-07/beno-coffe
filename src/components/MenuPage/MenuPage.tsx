/*
 Этот файл определяет страницу полного меню.
 Он показывает карточки с позициями меню, их ценой и описанием.
 Человек может посмотреть состав меню и выбрать интересующие позиции.
*/
import styles from "./MenuPage.module.css";

type MenuCategory = {
  value?: string | null;
} | null;

type MenuItem = {
  id?: number | string;
  name?: string | null;
  price?: number | null;
  category?: MenuCategory;
  description?: string | null;
  popular?: boolean | null;
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
  priceFallback: "Цена по запросу",
  categoryFallback: "Без категории",
  nameFallback: "Без названия",
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
              const categoryLabel =
                typeof item.category === "object" && item.category?.value
                  ? item.category.value
                  : menuPageText.categoryFallback;
              const description = item.description?.trim();
              const rawPrice =
                typeof item.price === "number"
                  ? item.price
                  : Number.parseFloat(String(item.price ?? "").replace(",", "."));
              const priceLabel = Number.isFinite(rawPrice)
                ? priceFormatter.format(rawPrice)
                : menuPageText.priceFallback;
              const nameLabel = item.name?.trim() || menuPageText.nameFallback;
              const isPopular = Boolean(item.popular);

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
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
