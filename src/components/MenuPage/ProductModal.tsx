/*
 Этот файл определяет всплывающее окно товара в меню.
 Он показывает фото, описание, варианты объема и цену выбранной позиции.
 Человек может закрыть окно или добавить товар в корзину.
*/
"use client";

import { useEffect, useState, useContext } from "react";
import Image from "next/image";
import styles from "./MenuPage.module.css"; // We'll add modal styles here
import {
    formatMenuPrice,
    getMenuPriceInfo,
    parseMenuPrice,
    type MenuItem,
} from "@/lib/menuData";
import { getMenuNameLabel, getMenuImageSrc } from "@/lib/menuView";
import { CartContext } from "@/components/Cart/CartProvider";

type ProductModalProps = {
    item: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    text: {
        nameFallback: string;
        variantsTitle: string;
        sizeFallback: string;
        priceFallback: string;
        addLabel: string;
    };
};

export default function ProductModal({
    item,
    isOpen,
    onClose,
    text,
}: ProductModalProps) {
    // Этот элемент хранит состояние анимации закрытия, чтобы окно успело плавно исчезнуть.
    const [isClosing, setIsClosing] = useState(false);
    // Этот объект дает доступ к корзине, чтобы добавлять выбранные товары.
    const cart = useContext(CartContext);

    // Этот блок управляет блокировкой прокрутки страницы и сбрасывает состояние анимации при открытии окна.
    useEffect(() => {
        let reopenTimerId: number | null = null;

        if (isOpen) {
            reopenTimerId = window.setTimeout(() => {
                setIsClosing(false);
            }, 0);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
            if (reopenTimerId !== null) {
                window.clearTimeout(reopenTimerId);
            }
        };
    }, [isOpen]);

    // Эта функция запускает анимацию закрытия и закрывает окно после завершения анимации.
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300); // Match CSS animation duration
    };

    if (!item && !isOpen) return null;

    // Этот объект сохраняет текущий товар на время анимации закрытия.
    const visibleItem = item;

    if (!visibleItem) return null;

    const nameLabel = getMenuNameLabel(visibleItem, text.nameFallback);
    const categoryLabel = ""; // We might not have this easily, or need to pass it. Optional for image.
    const imageSrc = getMenuImageSrc(nameLabel, categoryLabel);
    const description = visibleItem.description?.trim() ?? "";
    const priceInfo = getMenuPriceInfo(visibleItem);
    const rawPrice = priceInfo.rawPrice;
    const hasVariants = priceInfo.variants.length > 0;

    const addPrice = Number.isFinite(rawPrice)
        ? rawPrice
        : Number.isFinite(priceInfo.minVariantPrice)
            ? priceInfo.minVariantPrice
            : null;

    return (
        // Этот блок рисует затемнение и контейнер модального окна.
        <div
            className={`${styles.modalOverlay} ${isClosing ? styles.modalClosing : ""
                } ${!isOpen && !isClosing ? styles.hidden : ""}`}
            onClick={handleClose}
            aria-hidden={!isOpen}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`${styles.modalContent} ${isClosing ? styles.modalContentClosing : ""
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className={styles.closeButton}
                    onClick={handleClose}
                    aria-label="Close"
                >
                    ✕
                </button>

                {imageSrc && (
                    <div className={styles.modalImageWrapper}>
                        <Image
                            src={imageSrc}
                            alt={nameLabel}
                            fill
                            className={styles.modalImage}
                            sizes="(max-width: 768px) 100vw, 500px"
                        />
                    </div>
                )}

                <div className={styles.modalDetails}>
                    <h2 className={styles.modalTitle}>{nameLabel}</h2>

                    {description && (
                        <p className={styles.modalDescription}>{description}</p>
                    )}

                    {hasVariants ? (
                        <div className={styles.modalVariants}>
                            <p className={styles.detailsSectionTitle}>{text.variantsTitle}</p>
                            <ul className={styles.detailsVariants}>
                                {priceInfo.variants.map((variant, index) => {
                                    const sizeLabel = variant?.sizeName?.toString().trim() || text.sizeFallback;
                                    const mlLabel = Number.isFinite(variant?.ml) ? `${variant.ml} мл` : null;
                                    const variantPrice = parseMenuPrice(variant?.price);
                                    const variantPriceLabel = Number.isFinite(variantPrice)
                                        ? formatMenuPrice(variantPrice)
                                        : text.priceFallback;

                                    return (
                                        <li key={index} className={styles.detailsVariant}>
                                            <span className={styles.detailsVariantSize}>
                                                {sizeLabel}
                                                {mlLabel ? (
                                                    <span className={styles.detailsVariantMl}>
                                                        {" "}
                                                        · {mlLabel}
                                                    </span>
                                                ) : null}
                                            </span>
                                            <span className={styles.detailsVariantPrice}>
                                                {variantPriceLabel}
                                            </span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ) : (
                        <p className={styles.modalPrice}>
                            {Number.isFinite(rawPrice) ? formatMenuPrice(rawPrice) : ""}
                        </p>
                    )}

                    <button
                        className={styles.modalAddButton}
                        onClick={() => {
                            cart.addItem({
                                id: String(visibleItem.id),
                                name: nameLabel,
                                price: addPrice,
                            });
                            handleClose();
                        }}
                    >
                        {text.addLabel} {addPrice ? `• ${formatMenuPrice(addPrice)}` : ""}
                    </button>
                </div>
            </div>
        </div>
    );
}
