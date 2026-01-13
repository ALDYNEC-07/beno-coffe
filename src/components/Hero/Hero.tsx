/*
 Этот файл определяет главный приветственный блок сайта.
 Он показывает крупный заголовок, подзаголовок, видео и быстрые факты.
 Человек может перейти к контактам, меню и ключевым разделам.
*/
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

// Этот объект хранит время работы кофейни для блока на первом экране.
const heroWorkingHours = {
  startMinutes: 7 * 60,
  endMinutes: 24 * 60,
  label: "с 7:00 до 00:00",
  openLabel: "Открыто сейчас",
  closedLabel: "Закрыто сейчас",
};

export default function Hero() {
  // Эта ссылка хранит доступ к видео, чтобы включать и останавливать его.
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  return (
    // Этот блок показывает главный экран приветствия кофейни.
    <section className={styles.hero}>
      <div className="container">
        {/* Этот блок делит секцию на медиа и текстовую часть. */}
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
              <source src="/benocoffee.mp4" type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
            {/* Этот блок показывает статус работы поверх фото внизу. */}
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
          </div>

          {/* Этот блок показывает текст, факты и быстрые ссылки. */}
          <div className={styles.copy}>
            {/* Этот блок содержит главный заголовок. */}
            <div className="stack">
              <h1 className={styles.title}>BENO — место, куда возвращаются.</h1>
            </div>

            {/* Этот блок собирает ключевую информацию одним взглядом. */}
            <div
              className={styles.heroMeta}
              aria-label="Ключевая информация одним взглядом"
            >
              {/* Этот блок дает быстрые переходы к важным разделам и контактам. */}
              {/* Ссылки идут в одну линию, их можно листать вправо. */}
              <div
                className={`${styles.metaRow} ${styles.metaRowSpaced} ${styles.quickLinks}`}
                aria-label="Быстрые переходы"
              >
                <Link
                  className={`button ${styles.metaButton}`}
                  href="/map"
                  aria-label="Перейти к странице адреса"
                >
                  Контакты
                </Link>
                <Link className={`button ${styles.metaButton}`} href="/menu">
                  Смотреть меню
                </Link>
                <a className={`button ${styles.metaButton}`} href="/about#new">
                  Авторское
                </a>
                <a className={`button ${styles.metaButton}`} href="/about">
                  История BENO
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
