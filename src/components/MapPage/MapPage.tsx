/*
 Этот файл определяет страницу с адресом кофейни.
 Он показывает маршрут, ориентиры и блоки с полезной информацией.
 Человек может быстро понять, как добраться до кофейни.
*/
import styles from "./MapPage.module.css";

// Этот объект хранит весь текст и данные для страницы адреса.
const mapPageText = {
  actions: {
    primary: "Построить маршрут",
    secondary: "Скопировать адрес",
  },
  map: {
    title: "Кофейня ближе, чем вам кажется.",
    badge: "30 минут от центра",
    note: "В нескольких минутах от грозненского море.",
    embedUrl:
      "https://yandex.ru/map-widget/v1/?ll=45.658818%2C43.268665&z=16&mode=search&text=%D0%93%D1%80%D0%BE%D0%B7%D0%BD%D1%8B%D0%B9%2C%20%D0%9C%D0%B0%D0%BC%D1%81%D1%83%D1%80%D0%BE%D0%B2%D0%B0%2027",
    embedTitle: "Карта: Грозный, Мамсурова 27",
  },
  routesTitle: "Легко добраться",
  routes: [
    {
      title: "Пешком",
      description:
        "Вход прямо с улицы — без препятствий. Кофейню видно издалека: единственная стеклянная витрина среди ларьков.",
      detail: "Большая вывеска BENO — пройти мимо сложно.",
    },
    {
      title: "На машине",
      description:
        "Парковка прямо рядом с кофейней — буквально несколько шагов. Если мест нет, рядом есть ещё одна.",
      detail: "Оттуда до BENO — около минуты.",
    },
    {
      title: "На транспорте",
      description:
        "Выходите на ближайшей остановке — она прямо рядом с кофейней. Дальше — несколько шагов до входа.",
      detail: "Остановка совпадает с парковкой.",
    },
  ],
  final: {
    title: "Ждем в гости",
    text: "Заглядывайте на кофе, будем рады показать лучший столик.",
    primary: "Скоро откроем маршрут онлайн",
    secondary: "Посмотреть меню",
  },
};

// Этот компонент показывает основное содержимое страницы адреса.
export default function MapPage() {
  return (
    // Этот блок содержит всю страницу адреса и маршрута.
    <section className={styles.mapPage} aria-label="Страница адреса">
      <div className="container">
        {/* Этот блок показывает верхний экран страницы адреса. */}
        <div className={styles.hero}>
          {/* Этот блок содержит кнопки для быстрых действий. */}
          <div className={styles.heroCopy}>
            {/* Этот блок показывает кнопки для будущих действий. */}
            <div className={styles.actionRow} aria-label="Будущие действия">
              <button
                type="button"
                className={`button ${styles.actionButton}`}
                disabled
              >
                {mapPageText.actions.primary}
              </button>
              <button
                type="button"
                className={`button ${styles.actionButton}`}
                disabled
              >
                {mapPageText.actions.secondary}
              </button>
            </div>
          </div>

          {/* Этот блок показывает встроенную карту и подпись. */}
          <div className={styles.mapColumn}>
            <div className={styles.mapFrame}>
              <div className={styles.mapHeader}>
                <span className={styles.mapTag}>Карта</span>
                <span className={styles.mapBadge}>{mapPageText.map.badge}</span>
              </div>
              {/* Этот блок показывает встроенную карту с адресом кофейни. */}
              <div className={styles.mapCanvas}>
                <iframe
                  className={styles.mapEmbed}
                  src={mapPageText.map.embedUrl}
                  title={mapPageText.map.embedTitle}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
              <div className={styles.mapCopy}>
                <h2 className={styles.mapTitle}>{mapPageText.map.title}</h2>
                <p className={styles.mapNote}>{mapPageText.map.note}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Этот блок показывает варианты маршрута до кофейни. */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{mapPageText.routesTitle}</h2>
          <div className={styles.routeGrid}>
            {mapPageText.routes.map((route) => (
              <article key={route.title} className={styles.routeCard}>
                <h3 className={styles.routeTitle}>{route.title}</h3>
                <p className={styles.routeText}>{route.description}</p>
                <p className={styles.routeDetail}>{route.detail}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Этот блок завершает страницу приглашением в кофейню. */}
        <div className={styles.cta}>
          <div className={styles.ctaCopy}>
            <h2 className={styles.ctaTitle}>{mapPageText.final.title}</h2>
            <p className={styles.ctaText}>{mapPageText.final.text}</p>
          </div>
          <div className={styles.ctaActions}>
            <button
              type="button"
              className={`button ${styles.ctaButton}`}
              disabled
            >
              {mapPageText.final.primary}
            </button>
            <button
              type="button"
              className={`button ${styles.ctaButton}`}
              disabled
            >
              {mapPageText.final.secondary}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
