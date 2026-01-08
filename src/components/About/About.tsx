/*
 Этот файл определяет секцию "О нас".
 Он показывает краткую историю кофейни и место для фото команды.
 Человек может познакомиться с историей и атмосферой кофейни.
*/
import styles from "./About.module.css";

// Этот объект хранит заголовок и основной текст секции "О нас".
const aboutContent = {
  title: "О нас",
  description:
    "Мы начали с мечты о месте, где кофе — это искусство, а каждый гость — друг. За 7 лет BENO вырос из маленького старта в любимую кофейню района.",
};

// Этот объект хранит подпись для блока с фото команды или владельца.
const aboutMedia = {
  label: "Фото команды или владельца",
  note: "Плейсхолдер: фото команды / владельца (эмоциональная связь)",
};

export default function About() {
  return (
    // Этот блок показывает секцию "О нас" с якорем для навигации.
    <section id="about" className={styles.about} aria-label="Коротко о BENO">
      <div className="container">
        {/* Этот блок делит секцию на текстовую часть и медиа. */}
        <div className={styles.layout}>
          {/* Этот блок содержит заголовок и описание. */}
          <div className="stack">
            <h2 className={styles.title}>{aboutContent.title}</h2>
            <p className={styles.lead}>{aboutContent.description}</p>
          </div>

          {/* Этот блок показывает место для фото команды или владельца. */}
          <div className={styles.media} role="img" aria-label={aboutMedia.label}>
            <p className={styles.mediaText}>{aboutMedia.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
