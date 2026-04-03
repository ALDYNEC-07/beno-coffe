import type { MenuItem } from "@/lib/menuData";

// Локальная копия меню — источник правды для ИИ-бариста.
// Обновлять вручную при изменении меню в Baserow.
export const localMenu: MenuItem[] = [
  // ── Coffee ──────────────────────────────────────────────────────────────
  {
    id: 4,
    name: "Капучино",
    category: { value: "Coffee" },
    description:
      "Капучино — эспрессо под нежным облаком молока: сливочный вкус, плотная пенка и тёплое послевкусие.",
    popular: true,
    variants: [
      { sizeName: "маленький", ml: 250, price: "180" },
      { sizeName: "средний",   ml: 300, price: "230" },
      { sizeName: "большой",   ml: 400, price: "280" },
    ],
  },
  {
    id: 5,
    name: "Латте",
    category: { value: "Coffee" },
    description:
      "Латте — мягкий эспрессо с большим количеством тёплого молока и нежной пенкой.",
    popular: false,
    variants: [
      { sizeName: "средний", ml: 300, price: "230" },
      { sizeName: "большой", ml: 400, price: "280" },
    ],
  },
  {
    id: 34,
    name: "Эспрессо",
    category: { value: "Coffee" },
    description:
      "Эспрессо — короткий, крепкий шот с бархатистой крема и ярким ароматом.",
    popular: true,
    variants: [
      { sizeName: "одинарный", ml: 25, price: "120" },
      { sizeName: "двойной",   ml: 50, price: "140" },
    ],
  },
  {
    id: 67,
    name: "Американо",
    category: { value: "Coffee" },
    description:
      "Американо — эспрессо, разбавленный горячей водой: лёгкий, чистый вкус и длинное послевкусие.",
    popular: false,
    variants: [{ sizeName: null, ml: null, price: "150" }],
  },
  {
    id: 68,
    name: "Айс с урбечом",
    category: { value: "Coffee" },
    description:
      "Айс с урбечом — холодный кофе со льдом, урбечом и мороженым: орехово-кремовый вкус и мягкая сладость.",
    popular: true,
    variants: [{ sizeName: "большой", ml: 400, price: "350" }],
  },
  {
    id: 69,
    name: "Айс Латте",
    category: { value: "Coffee" },
    description:
      "Айс латте — холодный эспрессо с молоком и льдом: мягкий вкус и бодрая свежесть.",
    popular: true,
    variants: [{ sizeName: "средний", ml: 300, price: "230" }],
  },
  {
    id: 70,
    name: "Бамбл кофе",
    category: { value: "Coffee" },
    description:
      "Бамбл кофе — эспрессо с цитрусовым соком и льдом: сладко-кислый, яркий и освежающий.",
    popular: true,
    variants: [{ sizeName: "средний", ml: 300, price: "400" }],
  },
  {
    id: 71,
    name: "Фраппе",
    category: { value: "Coffee" },
    description:
      "Фраппе — взбитый холодный кофе со льдом: густой, бодрящий и приятно сливочный.",
    popular: false,
    variants: [{ sizeName: "средний", ml: 300, price: "250" }],
  },
  {
    id: 72,
    name: "Раф",
    category: { value: "Coffee" },
    description:
      "Раф — нежный кофе со сливками и ванилью: бархатный, сладковатый и очень уютный.",
    popular: true,
    variants: [
      { sizeName: "маленький", ml: 250, price: "200" },
      { sizeName: "средний",   ml: 300, price: "250" },
      { sizeName: "большой",   ml: 400, price: "350" },
    ],
  },

  // ── Chocolate ────────────────────────────────────────────────────────────
  {
    id: 73,
    name: "Горячий шоколад",
    category: { value: "Chocolate" },
    description:
      "Горячий шоколад — густой какао-напиток с насыщенным шоколадным вкусом.",
    popular: false,
    variants: [
      { sizeName: "маленький", ml: 250, price: "200" },
      { sizeName: "средний",   ml: 300, price: "250" },
      { sizeName: "большой",   ml: 400, price: "300" },
    ],
  },

  // ── Tea ──────────────────────────────────────────────────────────────────
  {
    id: 74,
    name: "Айва с персиком",
    category: { value: "Tea" },
    description: null,
    popular: false,
    variants: [{ sizeName: "чайник", ml: 500, price: "200" }],
  },
  {
    id: 75,
    name: "Граф Орлов",
    category: { value: "Tea" },
    description: null,
    popular: false,
    variants: [{ sizeName: "чайник", ml: 500, price: "200" }],
  },
  {
    id: 76,
    name: "Дикая вишня",
    category: { value: "Tea" },
    description: null,
    popular: false,
    variants: [{ sizeName: "чайник", ml: 500, price: "200" }],
  },
  {
    id: 77,
    name: "Имбирный",
    category: { value: "Tea" },
    description: null,
    popular: false,
    variants: [{ sizeName: "чайник", ml: 500, price: "200" }],
  },
  {
    id: 78,
    name: "Лев",
    category: { value: "Tea" },
    description:
      "Чай «Лев» — насыщенный чёрный чай с яркими цукатами, ягодами годжи и клюквы, цветочными лепестками календулы и сафлора и лёгким ароматом натуральных масел.",
    popular: false,
    variants: [{ sizeName: "чайник", ml: 500, price: "200" }],
  },

  // ── Milkshake ────────────────────────────────────────────────────────────
  {
    id: 79,
    name: "Банановый",
    category: { value: "Milkshake" },
    description:
      "Густой, сливочный коктейль со сладким банановым вкусом: мягкий, нежный и по-домашнему уютный.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "300" }],
  },
  {
    id: 80,
    name: "Клубничный",
    category: { value: "Milkshake" },
    description:
      "Нежный клубничный милкшейк: сладкий ягодный аромат, нежная прохлада, ощущение уютного десерта в стакане.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "300" }],
  },
  {
    id: 81,
    name: "Молочный",
    category: { value: "Milkshake" },
    description:
      "Нежный сливочно-ванильный вкус: мягкий, сладковатый, с молочной бархатистостью и лёгким тёплым послевкусием.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "300" }],
  },
  {
    id: 82,
    name: "Шоколадный",
    category: { value: "Milkshake" },
    description:
      "Шоколадный милкшейк — густой, сливочный и очень шоколадный: сладкий вкус какао, мягкая молочная нежность и лёгкая нотка десерта в послевкусии.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "300" }],
  },

  // ── Fresh ────────────────────────────────────────────────────────────────
  {
    id: 83,
    name: "Апельсиновый",
    category: { value: "Fresh" },
    description:
      "Апельсиновый фреш — яркий, сочный и бодрящий: сладость спелого апельсина, лёгкая кислинка и свежий цитрусовый аромат.",
    popular: true,
    variants: [{ sizeName: "средний", ml: 300, price: "300" }],
  },
  {
    id: 84,
    name: "Яблочный",
    category: { value: "Fresh" },
    description:
      "Яблочный фреш — свежий, сочный и ярко-фруктовый: лёгкая сладость спелого яблока, деликатная кислинка и чистое освежающее послевкусие.",
    popular: false,
    variants: [{ sizeName: "средний", ml: 300, price: "300" }],
  },
  {
    id: 85,
    name: "Яблоко-Апельсин",
    category: { value: "Fresh" },
    description:
      "Яблоко-Апельсин фреш — яркий и бодрящий: сладкое яблоко смягчает цитрусовую кислинку, оставляя сочное, свежее послевкусие.",
    popular: false,
    variants: [{ sizeName: "средний", ml: 300, price: "300" }],
  },
  {
    id: 86,
    name: "Гранат-Апельсин",
    category: { value: "Fresh" },
    description:
      "Гранат-апельсин фреш — яркий, кисло-сладкий и очень сочный: цитрусовая свежесть апельсина + терпкая гранатовая нотка с лёгким бодрящим послевкусием.",
    popular: false,
    variants: [{ sizeName: "средний", ml: 300, price: "300" }],
  },

  // ── Lemonade ─────────────────────────────────────────────────────────────
  {
    id: 87,
    name: "Ананасовый",
    category: { value: "Lemonade" },
    description:
      "Ананасовый лимонад — лёгкий и освежающий: сладкий тропический ананас, яркая лимонная кислинка и бодрые пузырьки в послевкусии.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "200" }],
  },
  {
    id: 88,
    name: "Голубая лагуна",
    category: { value: "Lemonade" },
    description:
      "Голубая лагуна — яркий, освежающий лимонад с цитрусовой кислинкой: лёгкая сладость, много льда и бодрая «морская» свежесть во вкусе.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "200" }],
  },
  {
    id: 89,
    name: "Манго-маракуя",
    category: { value: "Lemonade" },
    description:
      "Манго-маракуя — яркий тропический вкус: сладкое, сочное манго и бодрая кислинка маракуйи, с лёгкой ароматной терпкостью и освежающим послевкусием.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "200" }],
  },
  {
    id: 90,
    name: "Мохито классический",
    category: { value: "Lemonade" },
    description:
      "Мохито классический — очень освежающий: яркая кислинка лайма, прохладная мята и лёгкая сладость, всё это с бодрящим «ледяным» послевкусием.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "200" }],
  },
  {
    id: 91,
    name: "Мохито клубничный",
    category: { value: "Lemonade" },
    description:
      "Клубничный мохито — лёгкий, освежающий и ягодный: сочная клубника, цитрусовая кислинка лайма и прохладная мята, с приятной газированной «искрой».",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "200" }],
  },
  {
    id: 92,
    name: "Мохито манго",
    category: { value: "Lemonade" },
    description:
      "Мохито манго — тропически-сочный и освежающий: сладкое манго, кислинка лайма и прохладная мята, с лёгкими пузырьками и бодрым фруктовым послевкусием.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "200" }],
  },
  {
    id: 93,
    name: "Мохито ягодный",
    category: { value: "Lemonade" },
    description:
      "Мохито ягодный — сочный и освежающий: микс спелых ягод даёт яркую кисло-сладкую фруктовость, лайм добавляет бодрую свежесть, а мята — прохладное, чистое послевкусие.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "200" }],
  },
  {
    id: 94,
    name: "Тоска индейца",
    category: { value: "Lemonade" },
    description:
      "Тоска индейца — насыщенный тропический вкус: сочная сладость и яркая свежая кислинка, с лёгким фруктовым послевкусием.",
    popular: true,
    variants: [{ sizeName: "большой", ml: 400, price: "250" }],
  },
  {
    id: 95,
    name: "Яблочный",
    category: { value: "Lemonade" },
    description:
      "Яблочный мохито — свежий и лёгкий: сочное яблоко даёт мягкую сладость, лайм добавляет бодрую кислинку, а мята оставляет прохладное чистое послевкусие.",
    popular: false,
    variants: [{ sizeName: "большой", ml: 400, price: "200" }],
  },
  {
    id: 96,
    name: "Тоник",
    category: { value: "Lemonade" },
    description:
      "Тоник — эспрессо, чистый гранатовый сок и лёд: яркий, бодрящий, с приятной кислинкой.",
    popular: true,
    variants: [
      { sizeName: "средний", ml: 300, price: "250" },
      { sizeName: "большой", ml: 400, price: "300" },
    ],
  },

  // ── Dessert ──────────────────────────────────────────────────────────────
  {
    id: 97,
    name: "Круассан",
    category: { value: "Dessert" },
    description:
      "Круассан — слоёный, хрустящий снаружи и мягкий внутри, с тёплой шоколадной начинкой.",
    popular: true,
    variants: [{ sizeName: null, ml: null, price: "150" }],
  },
];
