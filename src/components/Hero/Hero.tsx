/*
 Этот файл определяет главный приветственный блок сайта.
 Он показывает фоновую картинку, статус работы и кнопки действий.
 Человек может увидеть текущее состояние кофейни, позвонить или перейти к меню.
*/
"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Hero.module.css";
import { contactData } from "@/components/shared/contactData";
import { businessData } from "@/components/shared/businessData";

// Этот объект берет общее время работы кофейни из одного общего источника.
const heroWorkingHours = businessData.workingHours;

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
  // Это поле хранит последнюю ширину окна, чтобы не пересчитывать высоту шапки при обычном вертикальном скролле.
  const viewportWidthRef = useRef<number | null>(null);
  // Это поле хранит текущую высоту верхней шапки, чтобы первый экран занимал остаток видимой области.
  // Пока точная высота еще не измерена, используется стабильная высота из общих стилей.
  const [heroNavOffset, setHeroNavOffset] = useState<number | null>(null);

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

    // Эта функция обновляет высоту шапки только когда меняется ширина окна.
    const updateOffset = (force = false) => {
      const nextWidth = window.innerWidth;
      const previousWidth = viewportWidthRef.current;

      if (
        !force &&
        previousWidth !== null &&
        Math.abs(nextWidth - previousWidth) < 1
      ) {
        return;
      }

      viewportWidthRef.current = nextWidth;
      const nextHeaderHeight = header.getBoundingClientRect().height;
      setHeroNavOffset((previousHeight) =>
        previousHeight !== null &&
        Math.abs(previousHeight - nextHeaderHeight) < 0.5
          ? previousHeight
          : nextHeaderHeight
      );
    };

    // Этот код делает первый точный расчет после того, как браузер закончит начальную разметку.
    const firstMeasureId = window.requestAnimationFrame(() => {
      updateOffset(true);
    });

    const handleResize = () => {
      updateOffset(false);
    };

    // Этот код обновляет высоту после поворота устройства, даже если браузер не дал обычный resize в нужный момент.
    const handleOrientationChange = () => {
      window.requestAnimationFrame(() => {
        updateOffset(true);
      });
    };

    updateOffset(true);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.cancelAnimationFrame(firstMeasureId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
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

  // Эти стили передают точную высоту шапки секции, когда она уже измерена в браузере.
  const heroStyle: HeroStyle | undefined =
    heroNavOffset === null
      ? undefined
      : {
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
