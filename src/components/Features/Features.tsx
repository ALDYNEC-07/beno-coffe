/*
 Этот файл определяет секцию преимуществ кофейни.
 Он показывает заголовок, короткое пояснение и карточки с причинами прийти.
 Человек может прочитать преимущества и попасть сюда по якорю #features.
*/
import type { CSSProperties } from "react";
import Image from "next/image";

import styles from "./Features.module.css";

// Эти пути нужны, чтобы показывать правильные логотипы в карточках.
const logoElRomaSrc = "/assets/logo-el-roma.png?v=2";
const logoAtmosferaSrc = "/assets/logo-atmosfera.png";
const logoDesertsSrc = "/assets/logo-deserts.png";

// Этот список хранит тексты карточек с ключевыми преимуществами, их логотипы и визуальный масштаб.
const features = [
  {
    title: "El Roma",
    subtitle:
      "Средняя обжарка. Арабика Cerrado + отборная робуста. Плотно, гладко: цитрус → шоколад → тост.",
    note: "«Сбалансированный эспрессо-бленд с характером».",
    iconSrc: logoElRomaSrc,
    iconAlt: "Логотип El Roma",
    iconScale: 2.2,
  },
  {
    title: "Уютная атмосфера",
    subtitle: "Пространство, в которое хочется возвращаться.",
    note: "«Творческое пространство и доброжелательные бариста — как дома».",
    iconSrc: logoAtmosferaSrc,
    iconAlt: "Логотип Atmosfera",
  },
  {
    title: "Свежая выпечка",
    subtitle:
      "Выпечка и десерты — свежие. Всегда найдётся и что-то воздушное, и что-то плотное, и что-то “на сегодня”.",
    note: "«Витрина меняется каждый день».",
    iconSrc: logoDesertsSrc,
    iconAlt: "Логотип Deserts",
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
            Сюда заходят за кофе, остаются — за ощущением.
          </p>
        </div>

        {/* Этот блок показывает карточки с ключевыми преимуществами. */}
        <div className={styles.featuresGrid}>
          {features.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              {/* Этот блок показывает логотип и основные тексты преимущества. */}
              <div className={styles.featureTop}>
                <div className={styles.iconBox}>
                  <Image
                    src={feature.iconSrc}
                    alt={feature.iconAlt ?? ""}
                    fill
                    sizes="52px"
                    className={styles.logo}
                    style={
                      {
                        "--logo-scale": feature.iconScale,
                      } as CSSProperties
                    }
                    unoptimized
                  />
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
