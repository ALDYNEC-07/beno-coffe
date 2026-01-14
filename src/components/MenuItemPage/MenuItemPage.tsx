/*
 Этот файл определяет страницу отдельной позиции меню.
 Он показывает фото выбранной позиции в самом начале страницы, затем описание, цену и варианты размера.
 Человек может посмотреть детали, позвонить или написать в WhatsApp и вернуться обратно к меню на главной странице.
*/
import Image from "next/image";
import Link from "next/link";
import styles from "./MenuItemPage.module.css";
import {
  formatMenuPrice,
  parseMenuPrice,
  type MenuItem,
} from "@/lib/menuData";
import { commonMenuText } from "@/lib/menuText";
import {
  getMenuCategoryLabel,
  getMenuDetailPriceInfo,
  getMenuNameLabel,
  getMenuImageSrc,
} from "@/lib/menuView";
import { contactData } from "@/components/shared/contactData";

type MenuItemPageProps = {
  item: MenuItem | null;
};

// Этот набор текста хранит заголовки, подписи и запасные значения.
const menuItemText = {
  ...commonMenuText,
  backLabel: "Вернуться к меню",
  notFoundTitle: "Такой позиции пока нет",
  notFoundLead: "Возможно, она появится чуть позже. Проверьте меню на главной странице.",
  priceLabel: "Цена",
  priceFromLabel: "Цена от",
  sizeFallback: "Размер не указан",
  variantsTitle: "Варианты размера",
  descriptionTitle: "Описание",
  callLabel: "Позвонить",
  whatsappLabel: "WhatsApp",
};

// Этот компонент показывает подробную карточку выбранной позиции меню с фото сверху, если оно есть.
export default function MenuItemPage({ item }: MenuItemPageProps) {
  // Этот блок держит ссылку для возврата в меню, чтобы не дублировать разметку.
  const backLink = (
    <Link className={styles.backLink} href="/#menu">
      ← {menuItemText.backLabel}
    </Link>
  );
  if (!item) {
    return (
      // Этот блок показывает сообщение, если позиция не найдена.
      <section className={styles.menuItemPage} aria-label="Позиция меню">
        <div className={`container ${styles.content}`}>
          {/* Этот блок показывает заголовок и подсказку, что делать дальше. */}
          <div className={styles.header}>
            <h1 className={styles.title}>{menuItemText.notFoundTitle}</h1>
            <p className={styles.lead}>{menuItemText.notFoundLead}</p>
          </div>

          {/* Этот блок ведет пользователя обратно к меню на главной странице. */}
          {backLink}
        </div>
      </section>
    );
  }

  // Этот блок готовит основные данные позиции для отображения.
  const nameLabel = getMenuNameLabel(item, menuItemText.nameFallback);
  const categoryLabel = getMenuCategoryLabel(
    item,
    menuItemText.categoryFallback
  );
  const description = item.description?.trim();
  // Этот блок определяет, есть ли фотография для выбранной позиции.
  const imageSrc = getMenuImageSrc(nameLabel, categoryLabel);
  // Этот текст заранее подставляется в сообщение WhatsApp для заказа выбранной позиции.
  const whatsappMessage = `Здравствуйте! ${nameLabel}, пожалуйста.
(если нужно, уточните какой объем нужен, сахар? сироп? и т.д.)
Оплата картой
Навынос
Буду через 15 минут`;
  // Эта ссылка отправляет пользователя в WhatsApp с готовым текстом заказа.
  const whatsappLink = `${contactData.socialLinks.whatsapp.href}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  // Этот блок держит кнопки для звонка и связи в WhatsApp, чтобы использовать их в нескольких местах страницы.
  const orderActions = (
    <>
      <a
        className="button"
        href={contactData.phoneLink}
        aria-label={`Позвонить по номеру ${contactData.phoneText}`}
      >
        {menuItemText.callLabel}
      </a>
      <a
        className="button"
        href={whatsappLink}
        aria-label={`Написать в ${menuItemText.whatsappLabel}`}
      >
        {menuItemText.whatsappLabel}
      </a>
    </>
  );

  // Этот блок рассчитывает цену и варианты, чтобы показать их на странице.
  const { priceInfo, priceLabel, priceTitle } = getMenuDetailPriceInfo(
    item,
    menuItemText
  );
  const isPopular = Boolean(item.popular);
  const hasVariants = priceInfo.variants.length > 0;

  return (
    // Этот блок показывает подробную страницу выбранной позиции меню.
    <section className={styles.menuItemPage} aria-label={nameLabel}>
      <div className={`container ${styles.content}`}>
        {/* Этот блок показывает основную фотографию выбранной позиции, если она есть. */}
        {imageSrc ? (
          <div className={styles.heroImageWrap}>
            <Image
              className={styles.heroImage}
              src={imageSrc}
              alt={nameLabel}
              fill
              priority
              sizes="(max-width: 960px) 100vw, 960px"
            />
          </div>
        ) : null}
        {/* Этот блок ведет пользователя обратно к меню на главной странице. */}
        {backLink}

        {/* Этот блок показывает название, категорию и статус популярности. */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{nameLabel}</h1>
            {isPopular ? (
              <span className={styles.badge} aria-label="Популярная позиция">
                {menuItemText.popularLabel}
              </span>
            ) : null}
          </div>
          <p className={styles.category}>{categoryLabel}</p>
        </div>

        {hasVariants ? (
          <>
            {/* Этот блок показывает кнопки для связи вместо общей цены, когда все цены указаны по размерам. */}
            <div className={styles.orderRow}>{orderActions}</div>
          </>
        ) : (
          <>
            {/* Этот блок показывает цену выбранной позиции, когда вариантов размера нет. */}
            <div className={styles.priceRow}>
              <span className={styles.priceTitle}>{priceTitle}</span>
              <span className={styles.priceValue}>{priceLabel}</span>
            </div>
          </>
        )}

        {/* Этот блок показывает описание позиции, если оно есть. */}
        {description ? (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{menuItemText.descriptionTitle}</h2>
            <p className={styles.description}>{description}</p>
          </div>
        ) : null}

        {/* Этот блок показывает список вариантов размера, если они есть. */}
        {hasVariants ? (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{menuItemText.variantsTitle}</h2>
            <ul className={styles.variants} aria-label="Варианты размера и цены">
              {priceInfo.variants.map((variant, variantIndex) => {
                const sizeLabel =
                  variant?.sizeName?.toString().trim() ||
                  menuItemText.sizeFallback;
                const variantPrice = parseMenuPrice(variant?.price);
                const variantPriceLabel = Number.isFinite(variantPrice)
                  ? formatMenuPrice(variantPrice)
                  : menuItemText.priceFallback;
                const mlLabel = Number.isFinite(variant?.ml)
                  ? `${variant.ml} мл`
                  : null;

                return (
                  <li
                    key={`${nameLabel}-${sizeLabel}-${variantIndex}`}
                    className={styles.variantItem}
                  >
                    <span className={styles.variantSize}>
                      {sizeLabel}
                      {mlLabel ? (
                        <span className={styles.variantMl}> · {mlLabel}</span>
                      ) : null}
                    </span>
                    <span className={styles.variantPrice}>
                      {variantPriceLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {!hasVariants ? (
          <>
            {/* Этот блок показывает кнопки для связи по выбранной позиции. */}
            <div className={styles.orderRow}>{orderActions}</div>
          </>
        ) : null}
      </div>
    </section>
  );
}
