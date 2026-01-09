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

type MenuImageEntry = {
  key: string;
  src: string;
};

// Этот список хранит файлы с фотографиями позиций меню из public/assets.
const menuImageFiles = [
  "bambl-coffee.jpg",
  "chocolate-hot-chocolate.jpg",
  "coffee-americano.jpg",
  "coffee-cappuccino.jpg",
  "coffee-espresso.jpg",
  "coffee-frappe.jpg",
  "coffee-iced-latte.jpg",
  "coffee-iced-with-urbech.jpg",
  "coffee-latte.jpg",
  "coffee-raf.jpg",
  "dessert-croissant.jpg",
  "fresh-apple-orange.jpg",
  "fresh-apple.jpg",
  "fresh-orange.jpg",
  "fresh-pomegranate-orange.jpg",
  "lemonade-apple.jpg",
  "lemonade-blue-lagoon.jpg",
  "lemonade-mango-passion-fruit.jpg",
  "lemonade-mojito-berry.jpg",
  "lemonade-mojito-classic.jpg",
  "lemonade-mojito-mango.jpg",
  "lemonade-mojito-strawberry.jpg",
  "lemonade-pineapple.jpg",
  "lemonade-tonic.jpg",
  "milkshake-banana.jpg",
  "milkshake-chocolate.jpg",
  "milkshake-classic.jpg",
  "milkshake-strawberry.jpg",
  "Toska-indeyca.jpg",
  "tea-count-orlov.jpg",
  "tea-ginger.jpg",
  "tea-lion.jpg",
  "tea-quince-with-peach.jpg",
  "tea-wild-cherry.jpg",
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

// Этот список переводит русские слова из названий в английские ключи файлов.
const tokenMap: Record<string, string> = {
  amerikano: "americano",
  kapuchino: "cappuccino",
  kappuchino: "cappuccino",
  cappuchino: "cappuccino",
  cappuccino: "cappuccino",
  espresso: "espresso",
  espreso: "espresso",
  latte: "latte",
  frappe: "frappe",
  frape: "frappe",
  raf: "raf",
  ays: "iced",
  ais: "iced",
  ice: "iced",
  iced: "iced",
  s: "with",
  urbech: "urbech",
  kruassan: "croissant",
  kruasan: "croissant",
  krossan: "croissant",
  croissant: "croissant",
  yabloko: "apple",
  yabloco: "apple",
  apelsin: "orange",
  granat: "pomegranate",
  ananas: "pineapple",
  mango: "mango",
  marakuya: "passion-fruit",
  marakuy: "passion-fruit",
  marakuia: "passion-fruit",
  marakuyya: "passion-fruit",
  mohito: "mojito",
  mojito: "mojito",
  klubnika: "strawberry",
  klubnichn: "strawberry",
  klubnichny: "strawberry",
  klubnichnyi: "strawberry",
  yagodny: "berry",
  yagodnyi: "berry",
  yagodn: "berry",
  yagoda: "berry",
  klassicheskiy: "classic",
  klassicheskii: "classic",
  klassik: "classic",
  shokolad: "chocolate",
  shokoladny: "chocolate",
  shokoladnyi: "chocolate",
  banan: "banana",
  imbir: "ginger",
  imbirny: "ginger",
  imbirniy: "ginger",
  molochniy: "classic",
  molochnyy: "classic",
  molochny: "classic",
  yablochn: "apple",
  yablochniy: "apple",
  yablochnyy: "apple",
  yablochny: "apple",
  tonik: "tonic",
  milksheyk: "milkshake",
  milksheik: "milkshake",
  lev: "lion",
  ayva: "quince",
  persik: "peach",
  dikaya: "wild",
  dikiy: "wild",
  vishnya: "cherry",
  goryachiy: "hot",
  gorjachiy: "hot",
  graf: "count",
  orlov: "orlov",
  golubaya: "blue",
  goluboy: "blue",
  laguna: "lagoon",
  kofe: "",
  coffee: "",
  chai: "",
  chay: "",
  tea: "",
  limonad: "",
  lemonade: "",
  fresh: "",
  fresch: "",
  fres: "",
  molochn: "",
  kokteyl: "",
  kokteil: "",
  milkshake: "",
  desert: "",
  dessert: "",
};

const tokenMapKeys = Object.keys(tokenMap).sort(
  (left, right) => right.length - left.length
);

// Этот список подбирает английскую категорию по русскому названию.
const categoryRules = [
  { key: "coffee", tokens: ["kofe", "coffee"] },
  { key: "tea", tokens: ["chai", "chay", "tea"] },
  { key: "lemonade", tokens: ["limonad", "lemonade"] },
  { key: "fresh", tokens: ["fresh", "fres", "fresch"] },
  {
    key: "milkshake",
    tokens: [
      "molochn",
      "kokteyl",
      "kokteil",
      "milkshake",
      "milkshey",
      "milksheyk",
      "milksheik",
    ],
  },
  { key: "dessert", tokens: ["dessert", "desert"] },
  { key: "chocolate", tokens: ["shokolad", "chocolate"] },
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
const menuImageEntries: MenuImageEntry[] = menuImageFiles.map((fileName) => ({
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

// Эта функция разбивает ключ на отдельные части.
function splitKeySegments(value: string) {
  return value.split(/[-+]+/).filter(Boolean);
}

// Эта функция проверяет, встречается ли фрагмент как отдельное слово внутри ключа.
function matchesKeySegment(valueKey: string, segmentKey: string) {
  if (!valueKey || !segmentKey) {
    return false;
  }
  if (valueKey === segmentKey) {
    return true;
  }
  const escapedKey = escapeRegex(segmentKey);
  const segmentRegex = new RegExp(`(^|[-+])${escapedKey}($|[-+])`);
  return segmentRegex.test(valueKey);
}

// Эта функция находит самый подходящий файл по частичному совпадению.
function findBestImageMatch(candidateKey: string) {
  let bestSrc: string | null = null;
  let bestLength = 0;
  let bestScore = 0;

  for (const entry of menuImageEntries) {
    if (!matchesKeySegment(entry.key, candidateKey)) {
      continue;
    }
    const score = entry.key.endsWith(candidateKey) ? 2 : 1;
    const isBetterMatch =
      bestSrc === null ||
      score > bestScore ||
      (score === bestScore && entry.key.length < bestLength);

    if (isBetterMatch) {
      bestSrc = entry.src;
      bestLength = entry.key.length;
      bestScore = score;
    }
  }

  return bestSrc;
}

// Эта функция приводит название к набору слов для поиска файла.
function splitLabelToTokens(value: string) {
  const trimmed = value.trim().toLowerCase();
  const transliterated = transliterateToLatin(trimmed);
  const normalized = normalizeKey(transliterated);
  return normalized.split(/[-+]+/).filter(Boolean);
}

// Эта функция переводит одно слово в ключ файла.
function mapToken(token: string) {
  if (Object.prototype.hasOwnProperty.call(tokenMap, token)) {
    return tokenMap[token];
  }
  const matchedKey = tokenMapKeys.find((key) => token.startsWith(key));
  if (matchedKey) {
    return tokenMap[matchedKey];
  }
  return token;
}

// Эта функция проверяет, есть ли слово с нужным началом в ключе.
function hasTokenPrefix(valueKey: string, token: string) {
  return splitKeySegments(valueKey).some((segment) => segment.startsWith(token));
}

// Эта функция переводит список слов в ключ файла.
function buildEnglishKey(value: string) {
  if (!value) {
    return "";
  }
  const tokens = splitLabelToTokens(value);
  const mappedTokens = tokens.flatMap((token) => {
    const mapped = mapToken(token);
    if (!mapped) {
      return [];
    }
    return mapped.split("-").filter(Boolean);
  });
  return normalizeKey(mappedTokens.join("-"));
}

// Эта функция подбирает английскую категорию по названию.
function getCategoryKey(label: string | null | undefined) {
  if (!label) {
    return null;
  }
  const rawKey = normalizeKey(transliterateToLatin(label.toLowerCase()));
  const mappedKey = buildEnglishKey(label);
  const probes = [rawKey, mappedKey].filter(Boolean);

  for (const rule of categoryRules) {
    const found = probes.some((probe) =>
      rule.tokens.some(
        (token) =>
          matchesKeySegment(probe, token) || hasTokenPrefix(probe, token)
      )
    );
    if (found) {
      return rule.key;
    }
  }

  return null;
}

// Эта функция убирает категорию из названия, если она там уже есть.
function stripCategoryPrefix(nameKey: string, categoryKey: string | null) {
  if (!categoryKey) {
    return nameKey;
  }
  if (nameKey === categoryKey) {
    return "";
  }
  const prefix = `${categoryKey}-`;
  if (nameKey.startsWith(prefix)) {
    return nameKey.slice(prefix.length);
  }
  return nameKey;
}

// Эта функция собирает возможные ключи для поиска картинки.
function buildImageCandidates(nameLabel: string, categoryLabel?: string) {
  const nameKey = buildEnglishKey(nameLabel);
  const categoryKey = getCategoryKey(categoryLabel);
  const trimmedNameKey = stripCategoryPrefix(nameKey, categoryKey);
  const candidates: string[] = [];

  if (categoryKey && trimmedNameKey) {
    // Сначала пробуем стандартный порядок, а потом обратный для нестандартных названий.
    candidates.push(`${categoryKey}-${trimmedNameKey}`);
    candidates.push(`${trimmedNameKey}-${categoryKey}`);
  }
  if (trimmedNameKey) {
    candidates.push(trimmedNameKey);
  }

  return candidates;
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

// Этот помощник подбирает фотофон по названию и категории позиции меню.
export function getMenuImageSrc(nameLabel: string, categoryLabel?: string) {
  const candidates = buildImageCandidates(nameLabel, categoryLabel);
  for (const candidate of candidates) {
    const directMatch = menuImageByKey.get(candidate);
    if (directMatch) {
      return directMatch;
    }
    const partialMatch = findBestImageMatch(candidate);
    if (partialMatch) {
      return partialMatch;
    }
  }
  return null;
}
