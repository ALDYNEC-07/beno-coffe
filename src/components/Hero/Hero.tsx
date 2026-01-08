/*
 Этот файл определяет главный приветственный блок сайта.
 Он показывает крупный заголовок, подзаголовок, видео и быстрые факты.
 Человек может перейти к контактам, меню и ключевым разделам.
*/
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

export default function Hero() {
  // Этот элемент хранит доступ к видео, чтобы управлять воспроизведением.
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Этот блок запускается при загрузке и включает видео только когда его видно.
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      videoElement.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoElement) {
          return;
        }

        if (entry.isIntersecting) {
          videoElement.play().catch(() => {});
          return;
        }

        videoElement.pause();
      },
      { threshold: 0.35 }
    );

    observer.observe(videoElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    // Этот блок показывает главный экран приветствия кофейни.
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* Этот блок делит секцию на медиа и текстовую часть. */}
        <div className={styles.layout}>
          {/* Этот блок показывает видео кофейни и включает его только когда оно в поле зрения. */}
          <div className={styles.media}>
            {/* Это видео задает атмосферу первой секции и проигрывается без звука. */}
            <video
              className={styles.mediaVideo}
              src="/benocoffee.mp4"
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Короткое видео интерьера кофейни BENO"
              ref={videoRef}
            />
          </div>

          {/* Этот блок показывает текст, факты и быстрые ссылки. */}
          <div className={styles.copy}>
            {/* Этот блок содержит заголовок и вводный текст. */}
            <div className={styles.stack}>
              <h1 className={styles.title}>BENO — больше, чем кофе</h1>
              <p className={styles.lead}>Заходите смелее — кофе уже заждался!</p>
            </div>

            {/* Этот блок собирает ключевую информацию одним взглядом. */}
            <div className={styles.heroMeta} aria-label="Ключевая информация одним взглядом">
              {/* Этот блок показывает статус и часы работы в одной строке. */}
              <div className={styles.metaRow}>
                {/* Этот элемент сообщает, открыта ли кофейня и до какого времени. */}
                <span className={styles.pill} aria-live="polite">
                  <span>Открыто сейчас</span>
                  <span aria-hidden="true">•</span>
                  <span>с 7:00 до 01:00</span>
                </span>
              </div>

              {/* Этот блок показывает адрес и быстрый переход к карте. */}
              <div className={styles.metaBlock} aria-label="Адрес и ориентир">
                <p className={styles.metaTitle}>Адрес</p>
                <p className={styles.metaValue}>Улица, дом — ориентир рядом</p>
                <div className={`${styles.metaRow} ${styles.metaRowCompact}`}>
                  <Link className={styles.button} href="/map" aria-label="Открыть карту и построить маршрут">
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
                <a className={styles.button} href="#footer" aria-label="Перейти к контактам и адресу">
                  Контакты
                </a>
                <Link className={styles.button} href="/menu">
                  Смотреть меню
                </Link>
                <a className={styles.button} href="#new">
                  Новинка месяца
                </a>
                <a className={styles.button} href="#about">
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
