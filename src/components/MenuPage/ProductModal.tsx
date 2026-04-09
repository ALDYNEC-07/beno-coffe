"use client";

import { useEffect, useState, useContext, useRef, useCallback } from "react";
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
    text: any; // Using 'any' briefly to match the text object structure from MenuPage, or we can export the type
};

export default function ProductModal({
    item,
    isOpen,
    onClose,
    text,
}: ProductModalProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasAudio, setHasAudio] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const rafRef = useRef<number>(0);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const cart = useContext(CartContext);

    // Анимация кольца по громкости
    const startVisualizer = useCallback(() => {
        const analyser = analyserRef.current;
        const btn = btnRef.current;
        if (!analyser || !btn) return;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
            analyser.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            const avg = sum / data.length / 255; // 0..1
            const ring1 = 3 + avg * 10;
            const ring2 = 8 + avg * 18;
            const ring3 = 14 + avg * 26;
            const op1 = 0.2 + avg * 0.35;
            const op2 = 0.12 + avg * 0.25;
            const op3 = 0.06 + avg * 0.15;
            btn.style.boxShadow = [
                `0 0 0 ${ring1}px rgba(27, 27, 27, ${op1})`,
                `0 0 0 ${ring2}px rgba(27, 27, 27, ${op2})`,
                `0 0 0 ${ring3}px rgba(27, 27, 27, ${op3})`,
            ].join(", ");
            rafRef.current = requestAnimationFrame(tick);
        };
        tick();
    }, []);

    const stopVisualizer = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        if (btnRef.current) btnRef.current.style.boxShadow = "";
    }, []);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
        stopVisualizer();
    }, [stopVisualizer]);

    const toggleAudio = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            stopVisualizer();
        } else {
            // Создаём AudioContext и AnalyserNode при первом воспроизведении
            if (!audioCtxRef.current) {
                const ctx = new AudioContext();
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                const source = ctx.createMediaElementSource(audio);
                source.connect(analyser);
                analyser.connect(ctx.destination);
                audioCtxRef.current = ctx;
                analyserRef.current = analyser;
                sourceRef.current = source;
            }
            // На мобильных AudioContext стартует в suspended — нужно разбудить
            if (audioCtxRef.current.state === "suspended") {
                await audioCtxRef.current.resume();
            }
            try {
                await audio.play();
                setIsPlaying(true);
                startVisualizer();
            } catch {
                // Браузер заблокировал воспроизведение
            }
        }
    }, [isPlaying, startVisualizer, stopVisualizer]);

    // Проверяем есть ли аудиофайл для позиции
    useEffect(() => {
        if (!item?.id) { setHasAudio(false); return; }
        // При смене позиции — сбрасываем всё
        stopVisualizer();
        if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
        analyserRef.current = null;
        sourceRef.current = null;
        setIsPlaying(false);
        setHasAudio(false);

        let cancelled = false;
        const audioUrl = `/audio/${item.id}.mp3`;

        // На мобильных canplaythrough не срабатывает — проверяем HEAD-запросом
        fetch(audioUrl, { method: "HEAD" })
            .then((res) => {
                if (cancelled) return;
                if (res.ok) {
                    setHasAudio(true);
                }
            })
            .catch(() => {});

        const audio = new Audio(audioUrl);
        audio.crossOrigin = "anonymous";
        audio.preload = "none";
        audio.addEventListener("ended", () => { setIsPlaying(false); stopVisualizer(); });
        audioRef.current = audio;
        return () => { cancelled = true; audio.pause(); audioRef.current = null; };
    }, [item?.id, stopVisualizer]);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleClose = () => {
        stopAudio();
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    if (!item && !isOpen) return null;

    // We keep rendering while closing to show the animation
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
                        <div className={styles.modalDescriptionRow}>
                            <p className={styles.modalDescription}>{description}</p>
                            {hasAudio && (
                                <button
                                    ref={btnRef}
                                    className={`${styles.audioBtn} ${isPlaying ? styles.audioBtnPlaying : ""}`}
                                    onClick={toggleAudio}
                                    aria-label={isPlaying ? "Остановить" : "Послушать описание"}
                                >
                                    {isPlaying ? (
                                        <span className={styles.audioBars}>
                                            <span /><span /><span /><span />
                                        </span>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </button>
                            )}
                        </div>
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
