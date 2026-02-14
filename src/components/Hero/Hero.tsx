/*
 Этот файл определяет главный приветственный блок сайта.
 Он показывает фоновую картинку, статус работы и быстрые кнопки действий.
 Человек может увидеть текущее состояние кофейни и сразу перейти к заказу или меню.
*/
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import styles from "./Hero.module.css";
import { contactData } from "@/components/shared/contactData";

// Этот объект хранит время работы кофейни для блока на первом экране.
const heroWorkingHours = {
  startMinutes: 7 * 60,
  endMinutes: 24 * 60,
  label: "с 7:00 до 00:00",
  openLabel: "Открыто сейчас",
  closedLabel: "Закрыто сейчас",
};

// Этот объект хранит подписи и ссылки для быстрых кнопок на первом экране.
const heroActionText = {
  primaryLabel: "Смотреть меню",
  primaryHref: "#menu",
  primaryAriaLabel: "Прокрутить к меню",
  secondaryLabel: "Быстрый заказ",
  secondaryHref: contactData.phoneLink,
  secondaryAriaLabel: `Позвонить по номеру ${contactData.phoneText}`,
};

// Этот объект хранит две картинки для главного экрана: когда кофейня открыта и когда закрыта.
const heroVisualState = {
  openImageSrc: "/benocoffe-open.png",
  closedImageSrc: "/benocoffe-close.png",
  openImageAlt: "Кофейня BENO во время работы",
  closedImageAlt: "Кофейня BENO после закрытия",
};

type HeroStyle = CSSProperties & {
  "--hero-nav-offset"?: string;
};

export default function Hero() {
  const [heroNavOffset, setHeroNavOffset] = useState(0);

  // Этот элемент хранит, открыта ли кофейня прямо сейчас.
  const [isOpenNow, setIsOpenNow] = useState(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return (
      minutes >= heroWorkingHours.startMinutes &&
      minutes < heroWorkingHours.endMinutes
    );
  });

  // Этот элемент выбирает нужную картинку для первого экрана по текущему статусу кофейни.
  const currentHeroImage = isOpenNow
    ? { src: heroVisualState.openImageSrc, alt: heroVisualState.openImageAlt }
    : { src: heroVisualState.closedImageSrc, alt: heroVisualState.closedImageAlt };

  // Этот код определяет высоту шапки, чтобы главный блок занимал оставшийся видимый экран.
  useLayoutEffect(() => {
    const header = document.querySelector("header");
    if (!header) {
      return;
    }

    const updateOffset = () => {
      setHeroNavOffset(header.offsetHeight);
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateOffset);
      resizeObserver.observe(header);
    }

    return () => {
      window.removeEventListener("resize", updateOffset);
      resizeObserver?.disconnect();
    };
  }, []);

  // Этот код обновляет статус работы кофейни в течение дня.
  useEffect(() => {
    // Эта функция пересчитывает, открыта ли кофейня в текущий момент.
    const updateOpenStatus = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      setIsOpenNow(
        minutes >= heroWorkingHours.startMinutes &&
          minutes < heroWorkingHours.endMinutes
      );
    };

    updateOpenStatus();
    const intervalId = window.setInterval(updateOpenStatus, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  // Эти стили передают высоту шапки секции, чтобы сам блок занимал оставшийся видимый экран.
  const heroStyle: HeroStyle = {
    "--hero-nav-offset": `${heroNavOffset}px`,
  };

  return (
    // Этот блок показывает главный экран приветствия кофейни.
    <section className={styles.hero} style={heroStyle}>
      <div className="container">
        {/* Этот блок размещает главный фон, статус и кнопки в сетке секции. */}
        <div className={styles.layout}>
          {/* Этот блок показывает главный фон и действия на первом экране. */}
          <div className={styles.media}>
            {/* Этот блок показывает фоновую картинку, которая меняется по статусу кофейни. */}
            <div className={styles.mediaVisual}>
              {/* Эта картинка автоматически выбирается: открыто сейчас или закрыто сейчас. */}
              <Image
                className={styles.mediaImage}
                src={currentHeroImage.src}
                alt={currentHeroImage.alt}
                fill
                priority
                sizes="100vw"
              />
            </div>
            {/* Этот слой делает фон чуть темнее, чтобы текст и кнопки читались лучше. */}
            <div className={styles.mediaShade} aria-hidden="true" />
            {/* Этот блок размещает статус и кнопки в нижней части первого экрана. */}
            <div className={styles.mediaOverlay}>
              {/* Этот блок объединяет статус работы и кнопки на одном фоне. */}
              <div className={styles.mediaTitle}>
                <div className={styles.mediaHeading}>
                  {/* Этот блок показывает статус работы, но на маленьких экранах скрывается. */}
                  <div className={styles.mediaBadge} aria-label="Время работы">
                    {/* Этот элемент сообщает, открыта ли кофейня и до какого времени. */}
                    <span
                      className={`${styles.pill} ${styles.mediaPill} ${
                        isOpenNow ? styles.mediaPillOpen : styles.mediaPillClosed
                      }`}
                      aria-live="polite"
                    >
                      <span>
                        {isOpenNow
                          ? heroWorkingHours.openLabel
                          : heroWorkingHours.closedLabel}
                      </span>
                      <span aria-hidden="true">•</span>
                      <span>{heroWorkingHours.label}</span>
                    </span>
                  </div>
                  {/* Этот блок показывает быстрые кнопки для перехода к меню и заказу. */}
                  <div className={styles.mediaActions}>
                    {/* Эта кнопка прокручивает страницу к меню. */}
                    <Link
                      className={`button ${styles.mediaActionButton}`}
                      href={heroActionText.primaryHref}
                      aria-label={heroActionText.primaryAriaLabel}
                    >
                      {heroActionText.primaryLabel}
                    </Link>
                    {/* Эта кнопка собирается вызвать номер для быстрого заказа. */}
                    <a
                      className={`button ${styles.mediaActionButton} ${styles.mediaActionSecondary}`}
                      href={heroActionText.secondaryHref}
                      aria-label={heroActionText.secondaryAriaLabel}
                    >
                      {heroActionText.secondaryLabel}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
