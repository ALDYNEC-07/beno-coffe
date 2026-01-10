/*
 Этот файл определяет подвал сайта.
 Он показывает контакты, адрес, часы работы и служебные ссылки.
 Человек может узнать расписание, связаться и перейти в соцсети или документы.
*/
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

// Этот объект хранит заголовок и слоган для первого блока подвала.
const footerIntro = {
  title: "BENO COFFEE",
  slogan: "BENO — место, куда возвращаются.",
};

// Этот объект хранит данные о кратком расписании и адресе.
const hoursInfo = {
  title: "Часы и адрес",
  todayLabel: "Сегодня: 8:00–20:00",
  addressLabel: "Адрес:",
  addressText: "Улица, дом — ориентир рядом",
  addressLink: "/map",
};

// Этот объект хранит данные для блока контактов.
const contactInfo = {
  title: "Контакты",
  phoneLabel: "Телефон:",
  phoneText: "+7 926 704-04-04",
  phoneLink: "tel:+79267040404",
  emailLabel: "E-mail:",
  emailText: "hello@beno.coffee",
  emailLink: "mailto:hello@beno.coffee",
  socialLabel: "Соцсети:",
};

// Этот список хранит ссылки на соцсети кофейни.
const socialLinks = [
  { label: "Instagram", href: "/instagram", ariaLabel: "Instagram BENO" },
  { label: "Facebook", href: "/facebook", ariaLabel: "Facebook BENO" },
];

// Этот диапазон лет нужен для строки копирайта внизу подвала.
const copyrightYears = "2019 - 2026";

export default function Footer() {
  // Этот объект хранит, какие блоки подвала сейчас раскрыты.
  const [openBlocks, setOpenBlocks] = useState({
    intro: false,
    hours: false,
    contact: false,
  });

  // Эта функция раскрывает блок связи, когда в адресе выбран подвал.
  const openContactFromHash = () => {
    if (typeof window === "undefined") {
      return;
    }
    if (window.location.hash === "#footer") {
      setOpenBlocks((prev) => ({ ...prev, contact: true }));
    }
  };

  // Эта функция переключает раскрытие блока при нажатии на его заголовок.
  const handleToggle = (blockKey: "intro" | "hours" | "contact") => {
    setOpenBlocks((prev) => ({ ...prev, [blockKey]: !prev[blockKey] }));
  };

  // Этот блок при загрузке и смене адреса раскрывает секцию связи в подвале.
  useEffect(() => {
    openContactFromHash();
    window.addEventListener("hashchange", openContactFromHash);
    return () => {
      window.removeEventListener("hashchange", openContactFromHash);
    };
  }, []);

  return (
    // Этот блок показывает подвал с контактами и служебной информацией.
    <footer id="footer" className={styles.footer} aria-label="Контакты и служебная информация">
      <div className="container">
        {/* Этот блок делит подвал на три основные колонки. */}
        <div className={styles.grid}>
          {/* Этот блок показывает слоган кофейни и раскрывает его по нажатию. */}
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>
              {/* Эта кнопка раскрывает и скрывает описание кофейни. */}
              <button
                type="button"
                className={`${styles.blockToggle} ${
                  openBlocks.intro ? styles.blockToggleOpen : ""
                }`}
                aria-expanded={openBlocks.intro}
                aria-controls="footer-intro"
                onClick={() => handleToggle("intro")}
              >
                <span>{footerIntro.title}</span>
                <span className={styles.chevron} aria-hidden="true" />
              </button>
            </h3>
            {/* Этот блок показывает слоган кофейни, когда он раскрыт. */}
            <div
              id="footer-intro"
              className={`${styles.blockContent} ${
                openBlocks.intro ? styles.blockContentOpen : ""
              }`}
            >
              <p className={`${styles.muted} ${styles.introText}`}>{footerIntro.slogan}</p>
            </div>
          </div>

          {/* Этот блок показывает часы работы и адрес и раскрывает детали по нажатию. */}
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>
              {/* Эта кнопка раскрывает и скрывает блок с часами и адресом. */}
              <button
                type="button"
                className={`${styles.blockToggle} ${
                  openBlocks.hours ? styles.blockToggleOpen : ""
                }`}
                aria-expanded={openBlocks.hours}
                aria-controls="footer-hours"
                onClick={() => handleToggle("hours")}
              >
                <span>{hoursInfo.title}</span>
                <span className={styles.chevron} aria-hidden="true" />
              </button>
            </h3>
            {/* Этот список показывает часы работы одной строкой и адрес, когда блок раскрыт. */}
            <div
              id="footer-hours"
              className={`${styles.blockContent} ${
                openBlocks.hours ? styles.blockContentOpen : ""
              }`}
            >
              <ul className={styles.list}>
                <li className={styles.hoursBig}>{hoursInfo.todayLabel}</li>
                <li>
                  <strong>{hoursInfo.addressLabel}</strong>{" "}
                  <Link className={styles.inlineLink} href={hoursInfo.addressLink}>
                    {hoursInfo.addressText}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Этот блок показывает телефон, почту и ссылки на соцсети и раскрывает детали по нажатию. */}
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>
              {/* Эта кнопка раскрывает и скрывает блок со связью и соцсетями. */}
              <button
                type="button"
                className={`${styles.blockToggle} ${
                  openBlocks.contact ? styles.blockToggleOpen : ""
                }`}
                aria-expanded={openBlocks.contact}
                aria-controls="footer-contact"
                onClick={() => handleToggle("contact")}
              >
                <span>{contactInfo.title}</span>
                <span className={styles.chevron} aria-hidden="true" />
              </button>
            </h3>
            {/* Этот список показывает способы связи и соцсети, когда блок раскрыт. */}
            <div
              id="footer-contact"
              className={`${styles.blockContent} ${
                openBlocks.contact ? styles.blockContentOpen : ""
              }`}
            >
              <ul className={styles.list}>
                <li>
                  <strong>{contactInfo.phoneLabel}</strong>{" "}
                  <a className={styles.inlineLink} href={contactInfo.phoneLink}>
                    {contactInfo.phoneText}
                  </a>
                </li>
                <li>
                  <strong>{contactInfo.emailLabel}</strong>{" "}
                  <a className={styles.inlineLink} href={contactInfo.emailLink}>
                    {contactInfo.emailText}
                  </a>
                </li>
                <li>
                  <strong>{contactInfo.socialLabel}</strong>
                  {/* Этот блок показывает кнопки для перехода в соцсети. */}
                  <span className={`${styles.metaRow} ${styles.metaRowSpaced}`}>
                    {socialLinks.map((link) => (
                      <Link
                        key={link.href}
                        className="button"
                        href={link.href}
                        aria-label={link.ariaLabel}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        {/* Этот блок показывает копирайт и служебные ссылки. */}
        <div className={styles.bottomRow}>
          <span className={styles.muted}>© {copyrightYears} BENO COFFEE</span>
          {/* Этот текст сообщает, что все права защищены. */}
          <span className={`${styles.muted} ${styles.legalLinks}`}>Все права защищены</span>
        </div>
      </div>
    </footer>
  );
}
