/*
 Этот файл определяет главный приветственный блок сайта.
 Он показывает видео, статус работы и быстрые кнопки действий.
 Человек может увидеть атмосферу, узнать время работы и перейти к заказу или меню.
*/
"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
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
  primaryLabel: "Быстрый заказ",
  primaryHref: contactData.socialLinks.whatsapp.href,
  primaryAriaLabel: "Открыть WhatsApp для быстрого заказа",
  secondaryLabel: "Смотреть меню",
  secondaryHref: "/#menu",
};

type HeroStyle = CSSProperties & {
  "--hero-nav-offset"?: string;
};

export default function Hero() {
  // Эта ссылка хранит доступ к видео, чтобы включать и останавливать его.
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

  // Этот код запускается сразу после появления секции, чтобы видео играло только в поле зрения.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    // Эта функция пытается запустить видео, когда его видно.
    const startVideo = async () => {
      try {
        await video.play();
      } catch {
        // Если браузер блокирует запуск, просто оставляем видео на паузе.
      }
    };

    // Эта функция останавливает видео, когда его не видно.
    const stopVideo = () => {
      video.pause();
    };

    if (!("IntersectionObserver" in window)) {
      startVideo();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startVideo();
          } else {
            stopVideo();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Этот код определяет высоту шапки, чтобы оставить видео ровно между ней и нижней границей экрана.
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
        {/* Этот блок размещает видео, статус и кнопки в сетке секции. */}
        <div className={styles.layout}>
          {/* Этот блок показывает видео кофейни. */}
          <div className={styles.media}>
            {/* Это видео само запускается, когда пользователь видит первый экран. */}
            <video
              className={styles.mediaImage}
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              aria-label="Видео интерьера кофейни BENO"
            >
              {/* Этот источник отдаёт мобильную заставку для узких экранов. */}
              <source
                src="/beno-video-hero-mobile.mp4"
                type="video/mp4"
                media="(max-width: 719px)"
              />
              {/* Этот источник показывает видео для остальных размеров экрана. */}
              <source
                src="/beno-video-hero-decktop.mp4"
                type="video/mp4"
              />
              Ваш браузер не поддерживает видео.
            </video>
            {/* Этот блок размещает статус и кнопки поверх видео внизу. */}
            <div className={styles.mediaOverlay}>
              {/* Этот блок объединяет статус работы и кнопки на одном фоне. */}
              <div className={styles.mediaTitle}>
                <div className={styles.mediaHeading}>
                  {/* Этот блок показывает статус работы поверх видео, но на маленьких экранах скрывается. */}
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
                  {/* Этот блок показывает быстрые кнопки для заказа и перехода к меню. */}
                  <div className={styles.mediaActions}>
                    {/* Эта кнопка ведет в WhatsApp для быстрого заказа. */}
                    <a
                      className={`button ${styles.mediaActionButton} ${styles.mediaActionPrimary}`}
                      href={heroActionText.primaryHref}
                      aria-label={heroActionText.primaryAriaLabel}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {heroActionText.primaryLabel}
                    </a>
                    {/* Эта кнопка прокручивает страницу к меню на главной. */}
                    <Link
                      className={`button ${styles.mediaActionButton}`}
                      href={heroActionText.secondaryHref}
                    >
                      {heroActionText.secondaryLabel}
                    </Link>
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
