/*
 Этот файл определяет главный приветственный блок сайта.
 Он показывает фоновую картинку, статус работы и кнопки действий.
 Человек может увидеть текущее состояние кофейни, позвонить или перейти к меню.
*/
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./Hero.module.css";
import { contactData } from "@/components/shared/contactData";
import { businessData } from "@/components/shared/businessData";

// Этот объект берет общее время работы кофейни из одного общего источника.
const heroWorkingHours = businessData.workingHours;

// Этот объект хранит подписи и цель для большой кнопки заказа на первом экране.
const heroOrderButtonText = {
  label: "Заказать",
  ariaLabel: "Плавно перейти к меню для заказа",
};

// Этот объект хранит текст и ссылку для кнопки звонка рядом со статусом.
const heroCallButtonText = {
  label: "Позвонить",
  href: contactData.phoneLink,
  ariaLabel: `Позвонить по номеру ${contactData.phoneText}`,
};



export default function Hero() {
  // Этот элемент хранит, открыта ли кофейня прямо сейчас.
  const [isOpenNow, setIsOpenNow] = useState(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return (
      minutes >= heroWorkingHours.startMinutes &&
      minutes < heroWorkingHours.endMinutes
    );
  });

  // Этот элемент выбирает подпись времени: до полуночи, когда открыто, или до утра, когда закрыто.
  const currentWorkingHoursLabel = isOpenNow
    ? heroWorkingHours.openUntilLabel
    : heroWorkingHours.closedUntilLabel;

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

    const intervalId = window.setInterval(updateOpenStatus, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.backgroundWrapper}>
        <div className={styles.desktopBg}>
          <Image
            src="/desktopbg.jpg"
            alt="Beno Coffee Background"
            fill
            priority
            quality={90}
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={styles.mobileBg}>
          <Image
            src="/mobilebg.png"
            alt="Beno Coffee Background"
            fill
            priority
            quality={90}
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={styles.overlay} />
      </div>

      <div className="container">
        <div className={styles.content}>
          {/* Этот блок размещает статус, кнопку и стрелки в нижней части экрана. */}
          {/* Main Interface Wrapper - Centers everything at the bottom */}
          <div className={styles.heroInterface}>

            {/* Top Row: Status + Call Button */}
            <div className={styles.statusRow}>
              <span
                className={`${styles.pill} ${styles.statusPill}`}
                aria-live="polite"
              >
                <span>{currentWorkingHoursLabel}</span>
              </span>

              <a
                className={`${styles.pill} ${styles.callButton}`}
                href={heroCallButtonText.href}
                aria-label={heroCallButtonText.ariaLabel}
              >
                {heroCallButtonText.label}
              </a>
            </div>

            {/* Main CTA Button */}
            <a
              href="#menu"
              className={styles.mainCta}
              aria-label={heroOrderButtonText.ariaLabel}
            >
              {heroOrderButtonText.label}
            </a>

            {/* Scroll Indicator */}
            <div className={styles.scrollIndicator} aria-hidden="true">
              <span className={styles.arrowMark} />
              <span className={styles.arrowMark} />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
