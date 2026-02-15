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
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
} from "react";
import styles from "./Navigation.module.css";
import { CartContext } from "@/components/Cart/CartProvider";
import { formatMenuPrice } from "@/lib/menuData";
import { contactData } from "@/components/shared/contactData";

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
  const { totalCount, items, increaseItemQuantity, decreaseItemQuantity } =
    useContext(CartContext);

  // CartProvider теперь гарантирует безопасность гидратации (начинает с 0), 
  // поэтому специальные проверки здесь больше не нужны.
  const visibleCartCount = totalCount;

  // Этот признак хранит, открыта ли панель корзины.
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Этот признак хранит, открыто ли меню прямо сейчас.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Этот признак хранит, что меню уже закрывается и ждет конца анимации.
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  // Эти ссылки на элементы помогают понять, был ли клик внутри кнопки корзины или внутри панели.
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);
  const cartPanelRef = useRef<HTMLElement | null>(null);
  // Этот текст помогает стилям понять, как именно ведет себя меню.
  const menuState = isMenuClosing ? "closing" : isMenuOpen ? "open" : "closed";
  // Этот признак показывает, видно ли мобильное меню на экране.
  const isPanelVisible = menuState !== "closed";

  // Этот блок закрывает корзину, если человек нажал в любом другом месте страницы.
  useEffect(() => {
    if (!isCartOpen) {
      return;
    }

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node | null;
      if (!targetNode) {
        return;
      }

      if (
        cartButtonRef.current?.contains(targetNode) ||
        cartPanelRef.current?.contains(targetNode)
      ) {
        return;
      }

      setIsCartOpen(false);
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
    };
  }, [isCartOpen]);

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

  // Этот обработчик добавляет одну порцию выбранной позиции прямо в корзине.
  const handleIncreaseItemClick = (id: string) => {
    increaseItemQuantity(id);
  };

  // Этот обработчик убирает одну порцию выбранной позиции прямо в корзине.
  const handleDecreaseItemClick = (id: string) => {
    decreaseItemQuantity(id);
  };

  // Этот признак показывает, есть ли в корзине позиции без точной цены.
  const hasItemsWithUnknownPrice = useMemo(
    () =>
      items.some(
        (item) => typeof item.price !== "number" || !Number.isFinite(item.price)
      ),
    [items]
  );

  // Эта сумма показывает итоговую цену всех позиций в корзине.
  const totalCartPrice = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (typeof item.price !== "number" || !Number.isFinite(item.price)) {
          return sum;
        }

        return sum + item.price * item.quantity;
      }, 0),
    [items]
  );

  // Этот текст показывает итог корзины в удобном виде для человека.
  const totalCartPriceText = hasItemsWithUnknownPrice
    ? "Цена уточняется"
    : formatMenuPrice(totalCartPrice);

  // Этот текст собирает готовое сообщение для заказа в WhatsApp.
  const whatsappOrderText = useMemo(() => {
    const orderLines = items.map((item, index) => {
      const linePriceText =
        typeof item.price === "number" && Number.isFinite(item.price)
          ? formatMenuPrice(item.price * item.quantity)
          : "Цена уточняется";

      return `${index + 1}. ${item.name} x${item.quantity} — ${linePriceText}`;
    });

    return [
      "Здравствуйте! Хочу оформить заказ:",
      ...orderLines,
      "",
      `Итог: ${totalCartPriceText}`,
    ].join("\n");
  }, [items, totalCartPriceText]);

  // Этот адрес открывает WhatsApp с уже заполненным текстом заказа.
  const whatsappOrderLink = useMemo(() => {
    const rawWhatsappLink = contactData.socialLinks.whatsapp.href;
    const phoneDigits = rawWhatsappLink.match(/\d+/g)?.join("") ?? "";
    if (!phoneDigits) {
      return rawWhatsappLink;
    }

    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(whatsappOrderText)}`;
  }, [whatsappOrderText]);

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
                ref={cartButtonRef}
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
                  ref={cartPanelRef}
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
                    <>
                      {/* Этот список показывает все позиции корзины с количеством и ценой по строке. */}
                      <ul className={styles.cartItemsList}>
                        {items.map((item) => {
                          const resolvedItemPrice =
                            typeof item.price === "number" &&
                              Number.isFinite(item.price)
                              ? item.price
                              : null;
                          const itemTotalPrice = resolvedItemPrice !== null
                            ? formatMenuPrice(resolvedItemPrice * item.quantity)
                            : "Цена уточняется";

                          return (
                            <li key={item.id} className={styles.cartItemRow}>
                              <span className={styles.cartItemName}>{item.name}</span>
                              {/* Этот блок в центре строки позволяет уменьшать и увеличивать количество позиции. */}
                              <span className={styles.cartItemControls}>
                                <button
                                  type="button"
                                  className={`${styles.cartQuantityButton} ${styles.cartQuantityButtonMinus}`}
                                  aria-label={`Уменьшить количество: ${item.name}`}
                                  onClick={() => handleDecreaseItemClick(item.id)}
                                >
                                  -
                                </button>
                                <span className={styles.cartItemQuantity}>
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  className={`${styles.cartQuantityButton} ${styles.cartQuantityButtonPlus}`}
                                  aria-label={`Увеличить количество: ${item.name}`}
                                  onClick={() => handleIncreaseItemClick(item.id)}
                                >
                                  +
                                </button>
                              </span>
                              <span className={styles.cartItemPrice}>
                                {itemTotalPrice}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      {/* Этот блок внизу корзины показывает итог и кнопку заказа в WhatsApp. */}
                      <div className={styles.cartSummary}>
                        <div className={styles.cartTotalRow}>
                          <span className={styles.cartTotalLabel}>Итого</span>
                          <span className={styles.cartTotalValue}>
                            {totalCartPriceText}
                          </span>
                        </div>
                        <a
                          className={styles.whatsappOrderButton}
                          href={whatsappOrderLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Заказать в WhatsApp"
                        >
                          Заказать в WhatsApp
                        </a>
                      </div>
                    </>
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
