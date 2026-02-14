/*
 Этот файл определяет главный приветственный блок сайта.
 Он показывает фоновую картинку, статус работы и кнопки действий.
 Человек может увидеть текущее состояние кофейни, позвонить или перейти к меню.
*/
"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import styles from "./Hero.module.css";
import { contactData } from "@/components/shared/contactData";

// Этот объект хранит время работы кофейни для блока на первом экране.
const heroWorkingHours = {
  startMinutes: 7 * 60,
  endMinutes: 24 * 60,
  openUntilLabel: "до 00:00",
  closedUntilLabel: "до 7:00",
};

// Этот объект хранит две картинки для главного экрана: когда кофейня открыта и когда закрыта.
const heroVisualState = {
  openImageSrc: "/benocoffe-open.jpg",
  closedImageSrc: "/benocoffe-close.jpg",
  openImageAlt: "Кофейня BENO во время работы",
  closedImageAlt: "Кофейня BENO после закрытия",
};

// Этот объект хранит подписи и цель для большой кнопки заказа на первом экране.
const heroOrderButtonText = {
  label: "Заказать",
  ariaLabel: "Плавно перейти к меню для заказа",
  menuSelector: "#menu",
};

// Этот объект хранит текст и ссылку для кнопки звонка рядом со статусом.
const heroCallButtonText = {
  label: "Позвонить",
  href: contactData.phoneLink,
  ariaLabel: `Позвонить по номеру ${contactData.phoneText}`,
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

  // Этот элемент выбирает подпись времени: до полуночи, когда открыто, или до утра, когда закрыто.
  const currentWorkingHoursLabel = isOpenNow
    ? heroWorkingHours.openUntilLabel
    : heroWorkingHours.closedUntilLabel;

  // Эта функция срабатывает по нажатию на кнопку и плавно прокручивает страницу к блоку меню.
  const handleOrderButtonClick = () => {
    const menuSection = document.querySelector<HTMLElement>(
      heroOrderButtonText.menuSelector
    );
    if (!menuSection) {
      return;
    }

    menuSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

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
        {/* Этот блок размещает главный фон и статус в сетке секции. */}
        <div className={styles.layout}>
          {/* Этот блок показывает главный фон и статус на первом экране. */}
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
            {/* Этот слой делает фон чуть темнее, чтобы статус читался лучше. */}
            <div className={styles.mediaShade} aria-hidden="true" />
            {/* Этот блок размещает статус, кнопку и стрелки в нижней части экрана. */}
            <div className={styles.orderButtonWrap}>
              {/* Этот блок ставит рядом статус времени и кнопку звонка одинакового визуального размера. */}
              <div className={styles.orderTopRow}>
                {/* Этот элемент показывает текст с временем для заказа. */}
                <div className={styles.orderStatus} aria-label="Время работы">
                  <span
                    className={`${styles.pill} ${styles.orderCallButton}`}
                    aria-live="polite"
                  >
                    <span>{currentWorkingHoursLabel}</span>
                  </span>
                </div>
                {/* Эта кнопка рядом со статусом позволяет быстро позвонить в кофейню. */}
                <a
                  className={`${styles.pill} ${styles.orderCallButton}`}
                  href={heroCallButtonText.href}
                  aria-label={heroCallButtonText.ariaLabel}
                >
                  {heroCallButtonText.label}
                </a>
              </div>
              {/* Эта кнопка плавно ведёт пользователя к блоку меню. */}
              <button
                type="button"
                className={styles.orderButton}
                onClick={handleOrderButtonClick}
                aria-label={heroOrderButtonText.ariaLabel}
              >
                {heroOrderButtonText.label}
              </button>
              {/* Этот элемент показывает декоративные стрелки вниз под кнопкой. */}
              <div className={styles.orderArrow} aria-hidden="true">
                <span className={styles.orderArrowMark} />
                <span className={styles.orderArrowMark} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
