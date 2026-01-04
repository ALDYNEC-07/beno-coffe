/*
 Этот файл задает верхнюю навигацию сайта.
 Он показывает название кофейни и кнопку меню с основными разделами.
 Человек может открыть меню и перейти по нужной ссылке.
*/
"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
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

// Этот набор параметров нужен, чтобы показать список ссылок в нужном виде.
type NavigationLinksListProps = {
  listClassName: string;
  linkClassName: string;
  onLinkClick?: () => void;
};

// Этот компонент рисует список ссылок навигации с нужным оформлением.
function NavigationLinksList({
  listClassName,
  linkClassName,
  onLinkClick,
}: NavigationLinksListProps) {
  // Этот список показывает все доступные пункты меню.
  return (
    <ul className={listClassName}>
      {navLinks.map((link) => (
        <li key={link.href}>
          <a className={linkClassName} href={link.href} onClick={onLinkClick}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Navigation() {
  // Этот счетчик помогает заново запускать анимацию при каждом открытии меню.
  const [menuOpenKey, setMenuOpenKey] = useState(0);
  // Этот признак хранит, открыто ли меню прямо сейчас.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Этот признак хранит, что меню в процессе плавного закрытия.
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  // Этот таймер нужен, чтобы закрытие дождалось конца анимации.
  const closeTimeoutRef = useRef<number | null>(null);

  // Это время закрытия совпадает с длительностью анимации в стиле.
  const closeAnimationMs = 360;
  // Этот текст помогает стилям понять, как именно ведет себя меню.
  const menuState = isMenuClosing ? "closing" : isMenuOpen ? "open" : "closed";

  // Этот блок открывает меню и запускает анимацию заново.
  const openMenu = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsMenuOpen(true);
    setIsMenuClosing(false);
    setMenuOpenKey((prevValue) => prevValue + 1);
  };

  // Этот блок запускает плавное закрытие меню.
  const closeMenu = () => {
    setIsMenuClosing(true);
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsMenuOpen(false);
      setIsMenuClosing(false);
      closeTimeoutRef.current = null;
    }, closeAnimationMs);
  };

  // Этот обработчик срабатывает при клике по кнопке меню.
  const handleMenuButtonClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (isMenuOpen && !isMenuClosing) {
      closeMenu();
      return;
    }
    openMenu();
  };

  // Этот обработчик закрывает меню, когда человек выбирает пункт.
  const handleMenuLinkClick = () => {
    if (isMenuOpen && !isMenuClosing) {
      closeMenu();
    }
  };

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
          <Link className={styles.brand} href="/" aria-label="BENO coffee — на главную">
            <span className={styles.brandName}>BENO кофейня</span>
          </Link>
          {/* Этот блок открывает основную навигацию по разделам. */}
          <nav className={styles.nav} aria-label="Основная навигация">
            {/* Этот элемент раскрывает список ссылок и удерживает страницу на месте при открытом меню. */}
            <details
              className={styles.menu}
              data-nav-menu
              data-menu-state={menuState}
              open={isMenuOpen}
            >
              {/* Этот элемент выглядит как иконка и открывает список ссылок. */}
              <summary className={styles.menuToggle} onClick={handleMenuButtonClick}>
                <span className={styles.burgerIcon} aria-hidden="true">
                  <span className={styles.burgerLine} />
                  <span className={styles.burgerLine} />
                  <span className={styles.burgerLine} />
                </span>
                <span className={styles.srOnly}>Меню</span>
              </summary>
              {/* Этот блок содержит список разделов, доступных в меню. */}
              <div className={styles.navPanel} key={menuOpenKey}>
                {/* Этот блок держит список ссылок по центру экрана. */}
                <div className={styles.navSheet}>
                  {/* Этот блок показывает ссылки внутри мобильного меню. */}
                  <NavigationLinksList
                    listClassName={styles.navList}
                    linkClassName={styles.navLink}
                    onLinkClick={handleMenuLinkClick}
                  />
                </div>
              </div>
            </details>
            {/* Этот список показывает все ссылки сразу на широких экранах. */}
            <NavigationLinksList
              listClassName={styles.desktopList}
              linkClassName={styles.desktopLink}
            />
          </nav>
        </div>
      </header>
    </>
  );
}
