/*
 Этот файл определяет секцию преимуществ кофейни.
 Он показывает заголовок, короткое пояснение и карточки с причинами прийти.
 Человек может прочитать преимущества и попасть сюда по якорю #features.
*/
import styles from "./Features.module.css";

// Этот список хранит тексты карточек с ключевыми преимуществами.
const features = [
  {
    title: "Отличный кофе",
    subtitle: "100% арабика specialty / своя обжарка или проверенный локальный обжарщик.",
    note: "«Спешиалти зерна и авторские рецепты».",
  },
  {
    title: "Уютная атмосфера",
    subtitle: "Пространство, в которое хочется возвращаться.",
    note: "«Творческое пространство и доброжелательные бариста — как дома».",
  },
  {
    title: "Свежая выпечка",
    subtitle: "Если есть выпечка/десерты — это must-see.",
    note: "«Каждое утро печём свежие круассаны».",
  },
];

export default function Features() {
  return (
    // Этот блок показывает секцию преимуществ с якорем для навигации.
    <section
      id="features"
      className={styles.features}
      aria-label="Ключевые преимущества BENO coffee"
    >
      <div className="container">
        {/* Этот блок показывает заголовок секции и короткое пояснение. */}
        <div className="stack">
          <h2 className={styles.title}>Почему BENO</h2>
          <p className={styles.lead}>
            Коротко и по делу — чтобы за 10 секунд стало понятно, что вас ждёт внутри.
          </p>
        </div>

        {/* Этот блок показывает карточки с ключевыми преимуществами. */}
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              {/* Этот блок показывает иконку и основные тексты преимущества. */}
              <div className={styles.featureTop}>
                <div className={styles.iconBox} aria-hidden="true">
                  иконка
                </div>
                <div className={styles.featureText}>
                  <h3 className={styles.subtitle}>{feature.title}</h3>
                  <p className={styles.muted}>{feature.subtitle}</p>
                </div>
              </div>
              <p className={styles.note}>{feature.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
