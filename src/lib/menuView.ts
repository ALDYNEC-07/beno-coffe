import { formatMenuPrice, getMenuPriceInfo, type MenuItem } from "@/lib/menuData";

type MenuListPriceText = {
  priceFromPrefix: string;
  priceFallback: string;
};

type MenuDetailPriceText = {
  priceLabel: string;
  priceFromLabel: string;
  priceFallback: string;
};

// Этот список связывает название позиции меню с видеофоном.
const menuVideoByName = [
  { key: "эспрессо", src: "/espresso.mp4" },
  { key: "капучино", src: "/cappuchino.mp4" },
  { key: "латте", src: "/latte.mp4" },
];

export function getMenuNameLabel(item: MenuItem, fallback: string) {
  const trimmedName = item.name?.trim();
  return trimmedName || fallback;
}

export function getMenuCategoryLabel(item: MenuItem, fallback: string) {
  const rawValue =
    typeof item.category === "object" && item.category?.value != null
      ? String(item.category.value)
      : "";
  const trimmedValue = rawValue.trim();
  return trimmedValue || fallback;
}

export function getMenuCategoryKey(label: string) {
  return label.trim().toLowerCase().replace(/\s+/g, "-");
}

export function getMenuListPriceLabel(item: MenuItem, text: MenuListPriceText) {
  const priceInfo = getMenuPriceInfo(item);
  if (Number.isFinite(priceInfo.rawPrice)) {
    return formatMenuPrice(priceInfo.rawPrice);
  }
  if (priceInfo.hasVariantPrices) {
    return `${text.priceFromPrefix} ${formatMenuPrice(priceInfo.minVariantPrice)}`;
  }
  return text.priceFallback;
}

export function getMenuDetailPriceInfo(item: MenuItem, text: MenuDetailPriceText) {
  const priceInfo = getMenuPriceInfo(item);
  const hasBasePrice = Number.isFinite(priceInfo.rawPrice);
  const hasVariantPrices = priceInfo.hasVariantPrices;
  const priceLabel = hasBasePrice
    ? formatMenuPrice(priceInfo.rawPrice)
    : hasVariantPrices
    ? formatMenuPrice(priceInfo.minVariantPrice)
    : text.priceFallback;
  const priceTitle = hasBasePrice
    ? text.priceLabel
    : hasVariantPrices
    ? text.priceFromLabel
    : text.priceLabel;

  return { priceInfo, priceLabel, priceTitle };
}

// Этот помощник подбирает видеофон по названию позиции меню.
export function getMenuVideoSrc(nameLabel: string) {
  const lowerName = nameLabel.trim().toLowerCase();
  const match = menuVideoByName.find((item) => lowerName.includes(item.key));
  return match?.src ?? null;
}
