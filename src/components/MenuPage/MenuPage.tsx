/*
 Этот файл определяет страницу полного меню.
 Он показывает минимальные карточки с названием, категорией и ценой.
 Человек может быстро просмотреть меню и открыть подробную страницу позиции.
*/
import Link from "next/link";
import styles from "./MenuPage.module.css";
import {
  formatMenuPrice,
  getMenuPriceInfo,
  type MenuItem,
} from "@/lib/menuData";

type MenuPageProps = {
  items: MenuItem[];
};

// Этот набор текста хранит заголовок и подсказки для страницы меню.
const menuPageText = {
  title: "Полное меню",
  empty: "Пока нет данных о меню. Загляните чуть позже!",
  popularLabel: "Популярно",
  priceFromPrefix: "от",
  priceFallback: "Цена по запросу",
  categoryFallback: "Без категории",
  nameFallback: "Без названия",
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
  return (
    // Этот блок содержит всю страницу меню и ее заголовок.
    <section className={styles.menuPage} aria-label="Полное меню">
      <div className={styles.container}>
        {/* Этот блок показывает заголовок страницы. */}
        <div className={styles.header}>
          <h1 className={styles.title}>{menuPageText.title}</h1>
        </div>

        {/* Этот блок показывает горизонтальную ленту карточек или сообщение об отсутствии данных. */}
        {items.length === 0 ? (
          <p className={styles.empty}>{menuPageText.empty}</p>
        ) : (
          <div className={styles.grid}>
            {items.map((item, index) => {
              // Этот блок готовит текст карточки и цену позиции.
              const nameLabel = item.name?.trim() || menuPageText.nameFallback;
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
              const cardClassName = videoSrc
                ? `${styles.card} ${styles.cardWithVideo}`
                : styles.card;

              return (
                // Этот блок делает карточку кликабельной и ведет к странице позиции.
                <Link
                  key={item.id ?? `${nameLabel}-${index}`}
                  className={styles.cardLink}
                  href={`/menu/${item.id}`}
                  aria-label={`Открыть позицию ${nameLabel}`}
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
