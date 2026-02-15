/*
 Этот файл определяет подвал сайта.
 Он показывает контакты, адрес, часы работы и служебные ссылки.
 Человек может узнать расписание, связаться и перейти в соцсети или документы.
*/
"use client";


import Link from "next/link";
import { contactData } from "@/components/shared/contactData";
import { businessData } from "@/components/shared/businessData";
import styles from "./Footer.module.css";

// Этот объект хранит заголовок и слоган для первого блока подвала.
const footerIntro = {
  title: "BENO COFFEE",
  slogan: "BENO — место, куда возвращаются.",
};

// Этот объект хранит данные о кратком расписании и адресе.
const hoursInfo = {
  title: "Часы и адрес",
  todayLabel: businessData.workingHours.dailyLabel,
  addressLabel: "Адрес:",
  addressText: contactData.addressText,
  addressLink:
    "https://2gis.ru/grozny/search/%D0%B3.%D0%93%D1%80%D0%BE%D0%B7%D0%BD%D1%8B%D0%B9%2C%20%D0%BF%D0%BE%D1%81%D0%B5%D0%BB%D0%BE%D0%BA%20%D0%A7%D0%B5%D1%80%D0%BD%D0%BE%D1%80%D0%B5%D1%87%D1%8C%D0%B5%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%20%D0%9C%D0%B0%D0%BC%D1%81%D1%83%D1%80%D0%BE%D0%B2%D0%B0%2027%20Grozny",
};

// Этот объект хранит данные для блока контактов.
const contactInfo = {
  title: "Контакты",
  phoneLabel: "Телефон:",
  phoneText: contactData.phoneText,
  phoneLink: contactData.phoneLink,
  socialLabel: "Соцсети:",
};

// Этот список хранит ссылки на соцсети кофейни.
const socialLinks = [
  contactData.socialLinks.instagram,
  contactData.socialLinks.whatsapp,
];

export default function Footer() {
  // Этот год нужен, чтобы строка копирайта обновлялась автоматически и не устаревала.
  const currentYear = new Date().getFullYear();
  // Этот текст показывает диапазон лет от старта кофейни до текущего года.
  const copyrightYears =
    currentYear > businessData.foundedYear
      ? `${businessData.foundedYear} - ${currentYear}`
      : String(businessData.foundedYear);

  return (
    // Этот блок показывает подвал с контактами и служебной информацией.
    <footer id="footer" className={styles.footer} aria-label="Контакты и служебная информация">
      <div className="container">
        {/* Этот блок делит подвал на три основные колонки. */}
        <div className={styles.grid}>
          {/* Этот блок показывает слоган кофейни. */}
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>{footerIntro.title}</h3>
            <div className={styles.blockContent}>
              <p className={`${styles.muted} ${styles.introText}`}>{footerIntro.slogan}</p>
            </div>
          </div>

          {/* Этот блок показывает часы работы и адрес. */}
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>{hoursInfo.title}</h3>
            <div className={styles.blockContent}>
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

          {/* Этот блок показывает телефон, почту и ссылки на соцсети. */}
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>{contactInfo.title}</h3>
            <div className={styles.blockContent}>
              <ul className={styles.list}>
                <li>
                  <strong>{contactInfo.phoneLabel}</strong>{" "}
                  <a className={styles.inlineLink} href={contactInfo.phoneLink}>
                    {contactInfo.phoneText}
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
