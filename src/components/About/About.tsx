/*
 Этот файл определяет секцию "О нас".
 Он показывает краткую историю кофейни и фото команды.
 Человек может познакомиться с историей и атмосферой кофейни.
*/
import Image from "next/image";
import styles from "./About.module.css";

// Этот объект хранит заголовок и основной текст секции "О нас".
const aboutContent = {
  title: "О нас",
  description:
    "Мы начали с мечты о месте, где кофе — это искусство, а каждый гость — друг. За 7 лет BENO вырос из маленького старта в любимую кофейню района.",
};

// Этот объект хранит путь и описание фото команды.
const aboutMedia = {
  src: "/assets/benoteam.jpg",
  alt: "Команда кофейни BENO",
};

export default function About() {
  return (
    // Этот блок показывает секцию "О нас" с якорем для навигации.
    <section id="about" className={styles.about} aria-label="Коротко о BENO">
      <div className="container">
        {/* Этот блок делит секцию на текстовую часть и медиа. */}
        <div className={styles.layout}>
          {/* Этот блок содержит заголовок и описание. */}
          <div className={`${styles.textColumn} stack`}>
            <h2 className={styles.title}>{aboutContent.title}</h2>
            <p className={styles.lead}>{aboutContent.description}</p>
          </div>

          {/* Этот блок показывает фото команды. */}
          <div className={styles.media}>
            {/* Это фото помогает показать атмосферу и команду кофейни. */}
            <Image
              src={aboutMedia.src}
              alt={aboutMedia.alt}
              fill
              sizes="(max-width: 719px) 90vw, (max-width: 900px) 50vw, 480px"
              className={styles.mediaImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
