/*
 Этот файл определяет секцию "Авторское".
 Он показывает описание сезонного предложения, карточку напитка и краткие анонсы.
 Человек может узнать об авторском напитке и перейти в меню.
*/
import Image from "next/image";
import Link from "next/link";
import styles from "./NewMonth.module.css";

// Этот объект хранит данные об авторском напитке и кнопке для перехода.
const monthlySpecial = {
  title: "Тоска индейца",
  description:
    "Яркий тропический вкус: сладкий, сочный и бодряще-кислый.",
  mediaLabel: "Фото авторского напитка",
  mediaSrc: "/assets/Toska-indeyca.jpg",
  mediaAlt: "Авторский напиток: тоска-индейца",
  menuLabel: "Посмотреть в меню",
  menuLink: `/?item=${encodeURIComponent("Тоска индейца")}#menu`,
};

// Этот список хранит короткие анонсы, которые дополняют авторский раздел.
const sideNotes = [
  {
    title: "Как придумали название?",
    text: "Рецепт «Тоска индейца» придумали мы, а имя — подписчик из Instagram.",
  },
  {
    title: "Есть идея нового напитка?",
    text: "Придумайте напиток мечты и пришлите нам. Если возьмём в работу — вы же дадите ему имя.",
  },
];

export default function NewMonth() {
  return (
    // Этот блок показывает секцию авторского предложения с якорем для навигации.
    <section id="new" className={styles.newMonth} aria-label="Авторское">
      <div className="container">
        {/* Этот блок делит секцию на основную часть и дополнительные анонсы. */}
        <div className={styles.layout}>
          {/* Этот блок показывает основную информацию об авторском напитке. */}
          <div className="stack">
            <h2 className={styles.title}>Авторское</h2>

            {/* Этот блок показывает карточку с авторским напитком. */}
            <article className={styles.card}>
              {/* Этот блок содержит фото с названием, описание и кнопку. */}
              <div className="stack">
                {/* Этот блок показывает фото авторского напитка. */}
                <div className={styles.media} role="img" aria-label={monthlySpecial.mediaLabel}>
                  <Image
                    src={monthlySpecial.mediaSrc}
                    alt={monthlySpecial.mediaAlt}
                    fill
                    sizes="(max-width: 719px) 90vw, (max-width: 900px) 70vw, 540px"
                    className={styles.mediaImage}
                  />
                </div>
                {/* Этот блок объединяет заголовок, описание и кнопку в отдельном блоке под фотографией. */}
                <div className={styles.textBlock}>
                  <div className="stack">
                    {/* Этот блок показывает название напитка под фотографией. */}
                    <h3 className={styles.mediaTitle}>{monthlySpecial.title}</h3>
                    {/* Этот блок описывает напиток. */}
                    <p className={styles.note}>{monthlySpecial.description}</p>
                  </div>
                  {/* Этот блок показывает кнопку для перехода к меню. */}
                  <div className={styles.metaRow}>
                    <Link className="button" href={monthlySpecial.menuLink}>
                      {monthlySpecial.menuLabel}
                    </Link>
                  </div>
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
