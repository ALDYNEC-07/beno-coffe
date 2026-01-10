/*
 Этот файл определяет главный приветственный блок сайта.
 Он показывает крупный заголовок, подзаголовок, видео и быстрые факты.
 Человек может перейти к контактам, меню и ключевым разделам.
*/
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  // Эта ссылка хранит доступ к видео, чтобы включать и останавливать его.
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
                className={`${styles.pill} ${styles.mediaPill}`}
                aria-live="polite"
              >
                <span>Открыто сейчас</span>
                <span aria-hidden="true">•</span>
                <span>с 7:00 до 01:00</span>
              </span>
            </div>
          </div>

          {/* Этот блок показывает текст, факты и быстрые ссылки. */}
          <div className={styles.copy}>
            {/* Этот блок содержит заголовок и вводный текст. */}
            <div className="stack">
              <h1 className={styles.title}>BENO — больше, чем кофе</h1>
              <p className={styles.lead}>Заходите смелее — кофе уже заждался!</p>
            </div>

            {/* Этот блок собирает ключевую информацию одним взглядом. */}
            <div
              className={styles.heroMeta}
              aria-label="Ключевая информация одним взглядом"
            >
              {/* Этот блок показывает адрес и быстрый переход к карте. */}
              <div className={styles.metaBlock} aria-label="Адрес и ориентир">
                <p className={styles.metaTitle}>Адрес</p>
                <p className={styles.metaValue}>Улица, дом — ориентир рядом</p>
                <div className={`${styles.metaRow} ${styles.metaRowCompact}`}>
                  <Link
                    className={`button ${styles.metaButton}`}
                    href="/map"
                    aria-label="Открыть карту и построить маршрут"
                  >
                    <span aria-hidden="true">🗺</span>
                    Как добраться
                  </Link>
                </div>
              </div>

              {/* Этот блок дает быстрые переходы к важным разделам и контактам. */}
              {/* Ссылки идут в одну линию, их можно листать вправо. */}
              <div
                className={`${styles.metaRow} ${styles.metaRowSpaced} ${styles.quickLinks}`}
                aria-label="Быстрые переходы"
              >
                <a
                  className={`button ${styles.metaButton}`}
                  href="#footer"
                  aria-label="Перейти к контактам и адресу"
                >
                  Контакты
                </a>
                <Link className={`button ${styles.metaButton}`} href="/menu">
                  Смотреть меню
                </Link>
                <a className={`button ${styles.metaButton}`} href="#new">
                  Авторское
                </a>
                <a className={`button ${styles.metaButton}`} href="#about">
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
