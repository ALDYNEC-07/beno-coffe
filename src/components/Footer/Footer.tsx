/*
 Этот файл определяет подвал сайта.
 Он показывает контакты, адрес, часы работы и служебные ссылки.
 Человек может узнать расписание, связаться и перейти в соцсети или документы.
*/
import Link from "next/link";
import styles from "./Footer.module.css";

// Этот объект хранит заголовок и описание для первого блока подвала.
const footerIntro = {
  title: "BENO coffee",
  description:
    "Адрес, часы, связь, соцсети — всё, что нужно в один клик. И да, часы тут “заметные”, как и положено ☕",
};

// Этот объект хранит данные о кратком расписании и адресе.
const hoursInfo = {
  title: "Часы и адрес",
  todayLabel: "Сегодня: 8:00–20:00",
  addressLabel: "Адрес:",
  addressText: "Улица, дом — ориентир рядом",
  addressLink: "/map",
};

// Этот объект хранит данные для блока связи.
const contactInfo = {
  title: "Связь",
  phoneLabel: "Телефон:",
  phoneText: "+0 (000) 000-00-00",
  phoneLink: "tel:+00000000000",
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

// Этот список хранит ссылки на служебные документы.
const legalLinks = [
  { label: "Политика", href: "/privacy" },
  { label: "Условия", href: "/terms" },
];

// Этот год нужен для строки копирайта внизу подвала.
const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    // Этот блок показывает подвал с контактами и служебной информацией.
    <footer id="footer" className={styles.footer} aria-label="Контакты и служебная информация">
      <div className={styles.container}>
        {/* Этот блок делит подвал на три основные колонки. */}
        <div className={styles.grid}>
          {/* Этот блок показывает краткое описание кофейни. */}
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>{footerIntro.title}</h3>
            <p className={`${styles.muted} ${styles.introText}`}>{footerIntro.description}</p>
          </div>

          {/* Этот блок показывает часы работы и адрес. */}
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>{hoursInfo.title}</h3>
            {/* Этот список показывает часы работы одной строкой и адрес. */}
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

          {/* Этот блок показывает телефон, почту и ссылки на соцсети. */}
          <div className={styles.block}>
            <h3 className={styles.blockTitle}>{contactInfo.title}</h3>
            {/* Этот список показывает способы связи и соцсети. */}
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
                      className={styles.button}
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

      <div className={`${styles.container} ${styles.bottom}`}>
        {/* Этот блок показывает копирайт и служебные ссылки. */}
        <div className={styles.bottomRow}>
          <span className={styles.muted}>© {currentYear} BENO coffee</span>
          {/* Этот блок показывает ссылки на служебные документы. */}
          <span className={`${styles.muted} ${styles.legalLinks}`}>
            {legalLinks.map((link) => (
              <span key={link.href} className={styles.legalItem}>
                <Link className={styles.inlineLink} href={link.href}>
                  {link.label}
                </Link>
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
