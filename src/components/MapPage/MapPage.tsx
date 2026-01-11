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
  routesTitle: "Как добраться",
  routes: [
    {
      title: "Пешком",
      icon: "👣",
      description: "Удобный вход с главной улицы, вывеску видно издалека.",
      detail: "От центральной площади — примерно 6–8 минут.",
    },
    {
      title: "На машине",
      icon: "🚗",
      description: "Подъезд с двух сторон квартала и просторный тротуар.",
      detail: "Остановиться можно на соседней парковке.",
    },
    {
      title: "На транспорте",
      icon: "🚌",
      description: "Остановка в 200 метрах, удобно идти по прямой.",
      detail: "Выходите у магазина и следуйте к вывеске BENO.",
    },
  ],
  detailsTitle: "Парковка и доступность",
  details: [
    {
      title: "Парковка",
      text: "Рядом есть открытая парковка и несколько мест вдоль улицы.",
    },
    {
      title: "Доступность",
      text: "Вход на уровне тротуара, двери широкие и удобные.",
    },
  ],
  hoursTitle: "Режим работы",
  hours: [
    { label: "Пн–Пт", value: "7:00–01:00" },
    { label: "Сб–Вс", value: "8:00–01:00" },
  ],
  hoursNote: "Если планируете поздний визит, лучше уточнить по телефону.",
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
                <div className={styles.routeIcon} aria-hidden="true">
                  {route.icon}
                </div>
                <h3 className={styles.routeTitle}>{route.title}</h3>
                <p className={styles.routeText}>{route.description}</p>
                <p className={styles.routeDetail}>{route.detail}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Этот блок показывает информацию о парковке и доступности. */}
        <div className={styles.sectionSplit}>
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>{mapPageText.detailsTitle}</h2>
            <div className={styles.infoGrid}>
              {mapPageText.details.map((detail) => (
                <div key={detail.title} className={styles.infoItem}>
                  <h3 className={styles.infoTitle}>{detail.title}</h3>
                  <p className={styles.infoText}>{detail.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Этот блок показывает режим работы и короткую подсказку. */}
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>{mapPageText.hoursTitle}</h2>
            <ul className={styles.hoursList}>
              {mapPageText.hours.map((hour) => (
                <li key={hour.label} className={styles.hoursItem}>
                  <span>{hour.label}</span>
                  <span className={styles.hoursValue}>{hour.value}</span>
                </li>
              ))}
            </ul>
            <p className={styles.hoursNote}>{mapPageText.hoursNote}</p>
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
