/*
 Этот файл задает верхнюю навигацию сайта.
 Он показывает название кофейни и кнопку меню с основными разделами.
 Человек может открыть меню и перейти по нужной ссылке.
*/
import styles from "./Navigation.module.css";

// Этот список хранит подписи и адреса для пунктов меню.
const navLinks: { href: string; label: string }[] = [
  { href: "#features", label: "Преимущества" },
  { href: "#new", label: "Новинка месяца" },
  { href: "#gallery", label: "Фото / Instagram" },
  { href: "#about", label: "О нас" },
  { href: "#footer", label: "Контакты" },
  { href: "/menu", label: "Полное меню" },
];

export default function Navigation() {
  return (
    <>
      {/* Этот элемент помогает сразу перейти к основному содержимому страницы. */}
      <a className={styles.skipLink} href="#main">
        Перейти к содержимому
      </a>
      {/* Этот блок показывает шапку с названием и меню. */}
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Этот блок ведет на главную страницу и показывает название кофейни. */}
          <a className={styles.brand} href="/" aria-label="BENO coffee — на главную">
            <span className={styles.brandName}>BENO кофейня</span>
          </a>
          {/* Этот блок открывает основную навигацию по разделам. */}
          <nav className={styles.nav} aria-label="Основная навигация">
            {/* Этот элемент раскрывает список ссылок для перехода на мобильных экранах. */}
            <details className={styles.menu}>
              {/* Этот элемент выглядит как иконка и открывает список ссылок. */}
              <summary className={styles.menuToggle}>
                <span className={styles.burgerIcon} aria-hidden="true">
                  <span className={styles.burgerLine} />
                  <span className={styles.burgerLine} />
                  <span className={styles.burgerLine} />
                </span>
                <span className={styles.srOnly}>Меню</span>
              </summary>
              {/* Этот блок содержит список разделов, доступных в меню. */}
              <div className={styles.navPanel}>
                {/* Этот список показывает все доступные пункты меню. */}
                <ul className={styles.navList}>
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a className={styles.navLink} href={link.href}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
            {/* Этот список показывает все ссылки сразу на широких экранах. */}
            <ul className={styles.desktopList}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a className={styles.desktopLink} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
