/*
 Этот файл определяет страницу с адресом кофейни.
 Он показывает маршрут, ориентиры и блоки с полезной информацией.
 Человек может быстро понять, как добраться до кофейни.
*/
"use client";

import { contactData } from "@/components/shared/contactData";
import styles from "./MapPage.module.css";

// Этот текст хранит адрес в формате для ссылок на карту.
const mapAddressQuery = encodeURIComponent(contactData.addressText);

// Этот список хранит действия для копирования и перехода в соцсети.
const copyActions = [
  { label: "Скопировать адрес", value: contactData.addressText, kind: "copy" },
  { label: "Скопировать номер", value: contactData.phoneText, kind: "copy" },
  {
    label: `Перейти в ${contactData.socialLinks.whatsapp.label}`,
    href: contactData.socialLinks.whatsapp.href,
    ariaLabel: `Открыть ${contactData.socialLinks.whatsapp.label} BENO`,
    kind: "link",
  },
  {
    label: `Перейти в ${contactData.socialLinks.instagram.label}`,
    href: contactData.socialLinks.instagram.href,
    ariaLabel: `Открыть ${contactData.socialLinks.instagram.label} BENO`,
    kind: "link",
  },
];

// Этот объект хранит весь текст и данные для страницы адреса.
const mapPageText = {
  copyActions,
  map: {
    title: "Кофейня ближе, чем вам кажется.",
    badge: "30 минут от центра",
    note: "В нескольких минутах от грозненского море.",
    embedUrl:
      `https://yandex.ru/map-widget/v1/?ll=45.658818%2C43.268665&z=16&mode=search&text=${mapAddressQuery}`,
    embedTitle: `Карта: ${contactData.addressText}`,
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
    primary: "Открыть маршрут онлайн",
    secondary: "Посмотреть меню",
    primaryHref:
      `https://yandex.ru/maps/?ll=45.658818%2C43.268665&z=16&text=${mapAddressQuery}`,
    secondaryHref: "/menu",
  },
};

// Этот компонент показывает основное содержимое страницы адреса.
export default function MapPage() {
  // Эта функция копирует выбранный текст и дает запасной способ, если копирование недоступно.
  const handleCopy = async (value: string) => {
    if (typeof navigator === "undefined") {
      return;
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch {
        // Если копирование не удалось, показываем текст для ручного копирования.
      }
    }

    window.prompt("Скопируйте текст:", value);
  };

  return (
    // Этот блок содержит всю страницу адреса и маршрута.
    <section className={styles.mapPage} aria-label="Страница адреса">
      <div className="container">
        {/* Этот блок показывает верхний экран страницы адреса. */}
        <div className={styles.hero}>
          {/* Этот блок показывает кнопки для копирования адреса и контактов. */}
          <div className={styles.actionRow} aria-label="Копирование контактов">
            {mapPageText.copyActions.map((action) =>
              action.kind === "link" ? (
                <a
                  key={action.label}
                  className={`button ${styles.actionButton}`}
                  href={action.href}
                  aria-label={action.ariaLabel}
                  target="_blank"
                  rel="noreferrer"
                >
                  {action.label}
                </a>
              ) : (
                <button
                  key={action.label}
                  type="button"
                  className={`button ${styles.actionButton}`}
                  onClick={() => handleCopy(action.value)}
                >
                  {action.label}
                </button>
              )
            )}
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
          {/* Этот блок показывает кнопки с основными действиями страницы. */}
          <div className={styles.ctaActions}>
            {/* Эта кнопка ведет на карту с маршрутом в новом окне. */}
            <a
              className={`button ${styles.ctaButton}`}
              href={mapPageText.final.primaryHref}
              target="_blank"
              rel="noreferrer"
            >
              {mapPageText.final.primary}
            </a>
            {/* Эта кнопка ведет на страницу полного меню. */}
            <a
              className={`button ${styles.ctaButton}`}
              href={mapPageText.final.secondaryHref}
            >
              {mapPageText.final.secondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
