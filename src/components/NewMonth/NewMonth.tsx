/*
 Этот файл определяет секцию "Новинка месяца".
 Он показывает описание сезонного предложения, карточку напитка и краткие анонсы.
 Человек может узнать о новинке и перейти в меню.
*/
import Link from "next/link";
import styles from "./NewMonth.module.css";

// Этот объект хранит данные о напитке месяца и кнопке для перехода.
const monthlySpecial = {
  title: "Пряный тыквенный латте",
  description: "«Специально к осени — пряный тыквенный латте».",
  summary:
    "Сезонное предложение или особый напиток — то, ради чего приятно “заглянуть ещё раз”.",
  mediaLabel: "Фото напитка месяца",
  mediaNote: "Плейсхолдер: фото чашки / сезонного напитка",
  menuLabel: "Посмотреть в меню",
  menuLink: "/menu#seasonal",
};

// Этот список хранит короткие анонсы, которые дополняют новинку месяца.
const sideNotes = [
  {
    title: "Короткий анонс",
    text: "Плейсхолдер под мини-новость: дегустация, скидка на альтернативу, событие в кофейне.",
  },
  {
    title: "Ещё одна заметка",
    text: "Плейсхолдер под “сегодня”: новые булочки, обновили фильтр, появился новый сироп.",
  },
];

export default function NewMonth() {
  return (
    // Этот блок показывает секцию новинки месяца с якорем для навигации.
    <section id="new" className={styles.newMonth} aria-label="Новинка месяца">
      <div className={styles.container}>
        {/* Этот блок делит секцию на основную часть и дополнительные анонсы. */}
        <div className={styles.layout}>
          {/* Этот блок показывает основную информацию о сезонной новинке. */}
          <div className={styles.stack}>
            <h2 className={styles.title}>Новинка месяца</h2>
            <p className={styles.lead}>{monthlySpecial.summary}</p>

            {/* Этот блок показывает карточку с напитком месяца. */}
            <article className={styles.card}>
              {/* Этот блок содержит фото-плейсхолдер, описание и кнопки. */}
              <div className={styles.stack}>
                {/* Этот блок показывает место для фото напитка. */}
                <div className={styles.media} role="img" aria-label={monthlySpecial.mediaLabel}>
                  <p className={styles.mediaText}>{monthlySpecial.mediaNote}</p>
                </div>
                <h3 className={styles.subtitle}>{monthlySpecial.title}</h3>
                <p className={styles.note}>{monthlySpecial.description}</p>
                {/* Этот блок показывает кнопку для перехода к меню. */}
                <div className={styles.metaRow}>
                  <Link className={styles.button} href={monthlySpecial.menuLink}>
                    {monthlySpecial.menuLabel}
                  </Link>
                </div>
              </div>
            </article>
          </div>

          {/* Этот блок показывает дополнительные короткие анонсы справа. */}
          <aside className={styles.aside} aria-label="Дополнительные анонсы">
            {sideNotes.map((note) => (
              <div key={note.title} className={styles.card}>
                {/* Этот блок показывает заголовок и текст анонса. */}
                <div className={styles.noteStack}>
                  <h3 className={styles.subtitle}>{note.title}</h3>
                  <p className={styles.muted}>{note.text}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
