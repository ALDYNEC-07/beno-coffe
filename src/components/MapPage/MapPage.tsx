/*
 Этот файл определяет страницу с адресом кофейни и будущей картой.
 Он показывает заголовок, пояснение и место под схему проезда.
 Человек может понять, что здесь будет информация о маршруте и адресе.
*/
import styles from "./MapPage.module.css";

// Этот объект хранит основные тексты для страницы адреса.
const mapPageText = {
  title: "Как добраться",
  description:
    "Здесь скоро появится подробный адрес, карта и варианты маршрута.",
  placeholderTitle: "Карта и маршрут в разработке",
  placeholderText:
    "Мы готовим удобную схему проезда и подсказки для гостей.",
};

// Этот компонент показывает основное содержимое страницы адреса.
export default function MapPage() {
  return (
    // Этот блок содержит всю страницу адреса и секцию с будущей картой.
    <section className={styles.mapPage} aria-labelledby="map-title">
      <div className="container">
        {/* Этот блок показывает заголовок и короткое объяснение страницы. */}
        <div className={styles.header}>
          <h1 id="map-title" className={styles.title}>
            {mapPageText.title}
          </h1>
          <p className={styles.description}>{mapPageText.description}</p>
        </div>

        {/* Этот блок показывает временную заглушку для карты и маршрута. */}
        <div className={styles.placeholder} role="status">
          <h2 className={styles.placeholderTitle}>
            {mapPageText.placeholderTitle}
          </h2>
          <p className={styles.placeholderText}>
            {mapPageText.placeholderText}
          </p>
        </div>
      </div>
    </section>
  );
}
