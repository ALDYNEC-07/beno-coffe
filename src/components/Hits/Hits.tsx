/*
 Этот файл определяет секцию "Хиты".
 Он показывает самые популярные позиции в формате сетки карточек.
 Человек может выбрать, что попробовать, и перейти в меню за подробностями.
*/
import Link from "next/link";
import styles from "./Hits.module.css";
import { fetchMenuItems } from "@/lib/menuApi";
import { commonMenuText } from "@/lib/menuText";
import { getMenuListPriceLabel, getMenuNameLabel } from "@/lib/menuView";

// Этот набор текста хранит подписи и запасные тексты для секции хитов.
const hitsText = {
  title: "Хиты кофейни",
  lead: "Самые популярные позиции, которые чаще всего выбирают гости.",
  empty: "Пока нет отмеченных популярных позиций. Загляните чуть позже!",
  descriptionFallback: "Описание появится чуть позже.",
  priceFromPrefix: "от",
  ...commonMenuText,
};

// Этот объект хранит данные для кнопки под сеткой.
const hitsAction = {
  label: "Смотреть все позиции в меню",
  link: "/menu",
};

export default async function Hits() {
  // Этот блок загружает меню и оставляет только позиции с пометкой "Популярно".
  const items = await fetchMenuItems();
  // Этот список хранит только популярные позиции из меню.
  const popularItems = items.filter((item) => Boolean(item?.popular));

  return (
    // Этот блок показывает секцию хитов с якорем для навигации.
    <section id="hits" className={styles.hits} aria-label="Хиты кофейни">
      <div className="container">
        {/* Этот блок показывает заголовок секции и короткое пояснение. */}
        <div className="stack">
          <h2 className={styles.title}>{hitsText.title}</h2>
          <p className={styles.lead}>{hitsText.lead}</p>
        </div>

        {/* Этот блок показывает сетку с карточками популярных позиций. */}
        {popularItems.length > 0 ? (
          <div className={styles.grid}>
            {popularItems.map((item) => {
              const nameLabel = getMenuNameLabel(item, hitsText.nameFallback);
              const description = item.description?.trim();
              const descriptionLabel =
                description || hitsText.descriptionFallback;
              const priceLabel = getMenuListPriceLabel(item, {
                priceFromPrefix: hitsText.priceFromPrefix,
                priceFallback: hitsText.priceFallback,
              });

              return (
                <article key={String(item.id ?? nameLabel)} className={styles.card}>
                  {/* Этот блок показывает название, описание и цену внутри карточки. */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{nameLabel}</h3>
                    <p className={styles.cardText}>{descriptionLabel}</p>
                    <p className={styles.cardNote}>{priceLabel}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          // Этот текст сообщает, что популярных позиций пока нет.
          <p className={styles.empty}>{hitsText.empty}</p>
        )}

        {/* Этот блок показывает кнопку перехода в меню. */}
        <div className={styles.metaRow}>
          <Link className="button" href={hitsAction.link}>
            {hitsAction.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
