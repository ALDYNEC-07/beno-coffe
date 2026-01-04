/*
 Этот файл определяет секцию "Хиты".
 Он показывает самые популярные позиции в формате сетки карточек.
 Человек может выбрать, что попробовать, и перейти в меню за подробностями.
*/
import Link from "next/link";
import styles from "./Hits.module.css";

// Этот список хранит данные о самых популярных позициях кофейни.
const hitItems = [
  {
    title: "Капучино BENO",
    description: "Сбалансированный вкус с плотной пеной и мягким послевкусием.",
    note: "Частый выбор для утреннего кофе.",
  },
  {
    title: "Флэт уайт",
    description: "Крепче, чем латте, но всё ещё мягко и сливочно.",
    note: "Любимая классика постоянных гостей.",
  },
  {
    title: "Сырный круассан",
    description: "Тёплая выпечка с хрустящей корочкой и нежной начинкой.",
    note: "Хит витрины к любому напитку.",
  },
  {
    title: "Матча латте",
    description: "Яркий вкус зелёного чая и молока для бодрого настроения.",
    note: "Альтернатива, которую берут всё чаще.",
  },
];

// Этот объект хранит данные для кнопки и подсказки под сеткой.
const hitsAction = {
  label: "Смотреть все хиты в меню",
  link: "/menu#hits",
  hint: "Подсказка: оставьте рядом место для сезонных новинок.",
};

export default function Hits() {
  return (
    // Этот блок показывает секцию хитов с якорем для навигации.
    <section id="hits" className={styles.hits} aria-label="Хиты кофейни">
      <div className={styles.container}>
        {/* Этот блок показывает заголовок секции и короткое пояснение. */}
        <div className={styles.stack}>
          <h2 className={styles.title}>Хиты кофейни</h2>
          <p className={styles.lead}>
            Самые популярные позиции, которые чаще всего выбирают гости.
          </p>
        </div>

        {/* Этот блок показывает сетку с карточками хитов. */}
        <div className={styles.grid}>
          {hitItems.map((item) => (
            <article key={item.title} className={styles.card}>
              {/* Этот блок показывает название, описание и пометку внутри карточки. */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.description}</p>
                <p className={styles.cardNote}>{item.note}</p>
              </div>
            </article>
          ))}
        </div>

        {/* Этот блок показывает кнопку перехода в меню и поясняющую подсказку. */}
        <div className={styles.metaRow}>
          <Link className={styles.button} href={hitsAction.link}>
            {hitsAction.label}
          </Link>
          <span className={styles.muted}>{hitsAction.hint}</span>
        </div>
      </div>
    </section>
  );
}
