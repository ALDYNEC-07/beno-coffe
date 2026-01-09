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

// Этот список хранит файлы с фотографиями позиций меню из public/assets.
const menuImageFiles = [
  "aci-latte.jpg",
  "americano.jpg",
  "ayva-s-persicom.jpg",
  "cappuchino.jpg",
  "desert-cruassan.jpg",
  "dikay-vishny.jpg",
  "espresso.jpg",
  "frappe.jpg",
  "fresh-apelsin.jpg",
  "fresh-granat+apelsin.jpg",
  "fresh-yabloco+apelsin.jpg",
  "fresh-yabloko.jpg",
  "graf-orlov.jpg",
  "hot-chocolate.jpg",
  "ice-s-urbech.jpg",
  "imbirniy.jpg",
  "latte.jpg",
  "lemonade-ananas.jpg",
  "lemonade-golubay-laguna.jpg",
  "lemonade-mango-marakuy.jpg",
  "lemonade-mohito-classic.jpg",
  "lemonade-mohito-klubnika.jpg",
  "lemonade-mohito-mango.jpg",
  "lemonade-mohito-yagodny.jpg",
  "lemonade-tonic.jpg",
  "lemonade-yablochny.jpg",
  "lev.jpg",
  "milkshake-banan.jpg",
  "milkshake-chocolate.jpg",
  "milkshake-klubnika.jpg",
  "milkshake-molochny.jpg",
  "raf.jpg",
];

// Этот набор букв нужен, чтобы переводить русские названия в латиницу.
const transliterationMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "i",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

// Этот список заменяет частые варианты написания на имена файлов.
const aliasReplacements: Array<[RegExp, string]> = [
  [/limonad/g, "lemonade"],
  [/klassik/g, "classic"],
  [/tonik/g, "tonic"],
  [/kruassan/g, "cruassan"],
  [/kappuchino/g, "cappuchino"],
  [/kapuchino/g, "cappuchino"],
  [/cappuccino/g, "cappuchino"],
  [/persik/g, "persic"],
  [/molochniy-kokteyl/g, "milkshake"],
  [/goryachiy-shokolad/g, "hot-chocolate"],
  [/shokolad/g, "chocolate"],
  [/ays/g, "ice"],
];

// Эта функция переводит русские буквы в латиницу.
function transliterateToLatin(value: string) {
  return value.replace(/[а-яё]/g, (char) => transliterationMap[char] ?? char);
}

// Эта функция приводит текст к единому ключу для сравнения.
function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/\.jpg$/, "")
    .replace(/[^a-z0-9+]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Эта таблица хранит быстрый доступ к файлам по ключу.
const menuImageEntries = menuImageFiles.map((fileName) => ({
  key: normalizeKey(fileName),
  src: `/assets/${fileName}`,
}));

const menuImageByKey = new Map(
  menuImageEntries.map((entry) => [entry.key, entry.src])
);

// Эта функция экранирует символы для поиска по регулярному выражению.
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Эта функция проверяет, встречается ли ключ как отдельное слово внутри названия.
function matchesKeySegment(nameKey: string, imageKey: string) {
  if (!nameKey || !imageKey) {
    return false;
  }
  if (nameKey === imageKey) {
    return true;
  }
  const escapedKey = escapeRegex(imageKey);
  const segmentRegex = new RegExp(`(^|[-+])${escapedKey}($|[-+])`);
  return segmentRegex.test(nameKey);
}

// Эта функция находит самый подходящий файл по частичному совпадению.
function findBestImageMatch(normalizedName: string) {
  let bestMatch: { src: string; length: number } | null = null;

  menuImageEntries.forEach((entry) => {
    if (!matchesKeySegment(normalizedName, entry.key)) {
      return;
    }
    if (!bestMatch || entry.key.length > bestMatch.length) {
      bestMatch = { src: entry.src, length: entry.key.length };
    }
  });

  return bestMatch?.src ?? null;
}

// Эта функция готовит название позиции для сравнения с именами файлов.
function normalizeMenuName(value: string) {
  const trimmed = value.trim().toLowerCase();
  const plusNormalized = trimmed.replace(/\s*\+\s*/g, "+");
  const transliterated = transliterateToLatin(plusNormalized);
  return normalizeKey(transliterated);
}

// Эта функция заменяет распространенные варианты написания.
function applyAliasReplacements(value: string) {
  let result = value;
  aliasReplacements.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });
  return normalizeKey(result);
}

// Эта функция упрощает окончания, чтобы меньше промахов.
function normalizeWordEndings(value: string) {
  return normalizeKey(
    value
      .replace(/aya(?=$|-)/g, "ay")
      .replace(/iya(?=$|-)/g, "iy")
      .replace(/ya(?=$|-)/g, "y")
      .replace(/yy(?=$|-)/g, "y")
  );
}

// Эта функция исправляет частые опечатки в именах.
function applySpellingFixes(value: string) {
  return normalizeKey(
    value
      .replace(/\bmolochniy\b/g, "molochny")
      .replace(/\byablochniy\b/g, "yablochny")
  );
}

// Эта функция делает несколько вариантов ключей, чтобы найти подходящее фото.
function buildMenuImageCandidates(nameLabel: string) {
  const base = normalizeMenuName(nameLabel);
  if (!base) {
    return [];
  }

  const candidates = new Set<string>();
  const addCandidate = (value: string) => {
    const normalized = normalizeKey(value);
    if (normalized) {
      candidates.add(normalized);
    }
  };

  addCandidate(base);

  const withAliases = applyAliasReplacements(base);
  addCandidate(withAliases);

  const withEndings = normalizeWordEndings(withAliases);
  addCandidate(withEndings);

  const withFixes = applySpellingFixes(withEndings);
  addCandidate(withFixes);

  addCandidate(withFixes.replace(/\byabloko\b/g, "yabloco"));
  addCandidate(withFixes.replace(/\bice\b/g, "aci"));

  return Array.from(candidates);
}

// Эта функция ищет файл изображения по одному кандидату.
function getImageFromCandidate(candidate: string) {
  const normalizedCandidate = normalizeKey(candidate);
  if (!normalizedCandidate) {
    return null;
  }
  const directMatch = menuImageByKey.get(normalizedCandidate);
  if (directMatch) {
    return directMatch;
  }
  return findBestImageMatch(normalizedCandidate);
}

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

// Этот помощник подбирает фотофон по названию позиции меню.
export function getMenuImageSrc(nameLabel: string) {
  const candidates = buildMenuImageCandidates(nameLabel);
  const match = candidates
    .map((candidate) => getImageFromCandidate(candidate))
    .find((src) => Boolean(src));
  return match ?? null;
}
