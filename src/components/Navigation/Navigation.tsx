/*
 Этот файл задает верхнюю навигацию сайта.
 Он показывает название кофейни, кнопку корзины и кнопку меню с основными разделами.
 Человек может открыть корзину, открыть меню и перейти по нужной ссылке.
*/
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useContext,
  useState,
  useSyncExternalStore,
  type AnimationEvent,
} from "react";
import styles from "./Navigation.module.css";
import { CartContext } from "@/components/Cart/CartProvider";

// Этот список хранит подписи и адреса для пунктов меню.
const navLinks: { href: string; label: string }[] = [
  { href: "/about#new", label: "Авторское" },
  { href: "/map", label: "Контакты" },
  { href: "/about", label: "О нас" },
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
          {/* Этот элемент показывает ссылку на нужный раздел. */}
          <Link
            className={linkClassName}
            href={link.href}
            onClick={onLinkClick}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Navigation() {
  // Эти данные показывают, сколько напитков в корзине и какие позиции уже добавлены.
  const { totalCount, items } = useContext(CartContext);
  // Этот признак показывает, что страница уже прошла гидратацию и можно показывать данные из браузера.
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  // Этот счетчик держит стабильный вывод до конца гидратации, чтобы избежать расхождения с сервером.
  const visibleCartCount = isHydrated ? totalCount : 0;
  // Этот признак хранит, открыта ли панель корзины.
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Этот признак хранит, открыто ли меню прямо сейчас.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Этот признак хранит, что меню уже закрывается и ждет конца анимации.
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  // Этот текст помогает стилям понять, как именно ведет себя меню.
  const menuState = isMenuClosing ? "closing" : isMenuOpen ? "open" : "closed";
  // Этот признак показывает, видно ли мобильное меню на экране.
  const isPanelVisible = menuState !== "closed";

  // Этот обработчик срабатывает при клике по кнопке меню.
  const handleMenuButtonClick = () => {
    setIsCartOpen(false);
    if (isMenuOpen && !isMenuClosing) {
      setIsMenuClosing(true);
      return;
    }
    setIsMenuOpen(true);
    setIsMenuClosing(false);
  };

  // Этот обработчик закрывает меню, когда человек выбирает пункт.
  const handleMenuLinkClick = () => {
    if (isMenuOpen) {
      setIsMenuClosing(true);
    }
  };

  // Этот обработчик закрывает меню после завершения анимации.
  const handleMenuAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (!isMenuClosing || event.currentTarget !== event.target) {
      return;
    }
    setIsMenuOpen(false);
    setIsMenuClosing(false);
  };

  // Этот обработчик открывает и закрывает панель корзины по клику на иконку.
  const handleCartButtonClick = () => {
    setIsCartOpen((previousValue) => !previousValue);
  };

  return (
    <>
      {/* Этот блок показывает шапку с названием и меню. */}
      <header className={styles.header}>
        <div className={`container ${styles.content}`}>
          {/* Этот блок ведет на главную страницу и показывает название кофейни. */}
          <Link className={styles.brand} href="/" aria-label="BENO coffee — на главную">
            <span className={styles.brandName}>BENO COFFEE</span>
          </Link>
          {/* Этот блок открывает основную навигацию по разделам. */}
          <nav className={styles.nav} aria-label="Основная навигация">
            {/* Этот блок показывает иконку корзины и кнопку мобильного меню рядом друг с другом. */}
            <div className={styles.primaryActions}>
              {/* Этот элемент показывает иконку корзины и счетчик выбранных напитков. */}
              <button
                type="button"
                className={styles.cartButton}
                aria-label={`Корзина: ${visibleCartCount}`}
                aria-expanded={isCartOpen}
                aria-controls="nav-cart-panel"
                onClick={handleCartButtonClick}
              >
                <Image
                  className={styles.cartIcon}
                  src="/bag-icon.svg"
                  alt=""
                  width={21}
                  height={21}
                  aria-hidden="true"
                />
                {visibleCartCount > 0 ? (
                  <span className={styles.cartBadge} aria-hidden="true">
                    {visibleCartCount}
                  </span>
                ) : null}
                <span className={styles.srOnly}>Корзина</span>
              </button>
              {/* Этот блок показывает мини-панель корзины с выбранными позициями. */}
              {isCartOpen ? (
                <section
                  className={styles.cartPanel}
                  id="nav-cart-panel"
                  aria-label="Корзина"
                >
                  <div className={styles.cartPanelHeader}>
                    <p className={styles.cartPanelTitle}>Корзина</p>
                  </div>
                  {items.length === 0 ? (
                    <p className={styles.cartEmptyText}>
                      В корзине пока ничего нет.
                    </p>
                  ) : (
                    <ul className={styles.cartItemsList}>
                      {items.map((item) => (
                        <li key={item.id} className={styles.cartItemRow}>
                          <span className={styles.cartItemName}>{item.name}</span>
                          <span className={styles.cartItemQuantity}>
                            {item.quantity} шт
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ) : null}
              {/* Этот элемент раскрывает список ссылок и удерживает страницу на месте при открытом меню. */}
              <div className={styles.menu} data-nav-menu data-menu-state={menuState}>
                {/* Этот элемент выглядит как иконка и открывает список ссылок. */}
                <button
                  type="button"
                  className={styles.menuToggle}
                  onClick={handleMenuButtonClick}
                  aria-expanded={isMenuOpen}
                  aria-controls="nav-panel"
                >
                  <span className={styles.burgerIcon} aria-hidden="true">
                    <span className={styles.burgerLine} />
                    <span className={styles.burgerLine} />
                  </span>
                  <span className={styles.srOnly}>Меню</span>
                </button>
                {/* Этот блок содержит список разделов, доступных в меню. */}
                <div
                  className={styles.navPanel}
                  id="nav-panel"
                  aria-hidden={!isPanelVisible}
                  onAnimationEnd={handleMenuAnimationEnd}
                >
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
              </div>
            </div>
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
