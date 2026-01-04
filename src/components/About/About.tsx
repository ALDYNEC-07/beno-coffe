/*
 Этот файл определяет секцию "О нас".
 Он показывает краткую историю кофейни, кнопки перехода и место для фото команды.
 Человек может перейти к подробной странице о кофейне или команде.
*/
import Link from "next/link";
import styles from "./About.module.css";

// Этот объект хранит заголовок и основной текст секции "О нас".
const aboutContent = {
  title: "О нас",
  description:
    "«Мы начали с мечты о месте, где кофе — это искусство, а каждый гость — друг. За 5 лет BENO вырос из домашней обжарки в любимую кофейню района».",
};

// Этот список хранит ссылки для перехода к подробным разделам о кофейне.
const aboutLinks = [
  { label: "Узнать больше", href: "/about" },
  { label: "Команда", href: "/about#team" },
];

// Этот объект хранит подпись для блока с фото команды или владельца.
const aboutMedia = {
  label: "Фото команды или владельца",
  note: "Плейсхолдер: фото команды / владельца (эмоциональная связь)",
};

export default function About() {
  return (
    // Этот блок показывает секцию "О нас" с якорем для навигации.
    <section id="about" className={styles.about} aria-label="Коротко о BENO">
      <div className={styles.container}>
        {/* Этот блок делит секцию на текстовую часть и медиа. */}
        <div className={styles.layout}>
          {/* Этот блок содержит заголовок, описание и кнопки перехода. */}
          <div className={styles.stack}>
            <h2 className={styles.title}>{aboutContent.title}</h2>
            <p className={styles.lead}>{aboutContent.description}</p>
            {/* Этот блок показывает кнопки перехода к подробным разделам. */}
            <div className={styles.metaRow}>
              {aboutLinks.map((link) => (
                <Link key={link.href} className={styles.button} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
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
