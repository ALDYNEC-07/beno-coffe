/*
 Этот файл определяет страницу "О нас".
 Он показывает историю кофейни, причины выбрать BENO, авторскую новинку и хиты.
 Человек может познакомиться с атмосферой и узнать больше о BENO.
*/
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer/Footer";
import Features from "@/components/Features/Features";
import About from "@/components/About/About";
import NewMonth from "@/components/NewMonth/NewMonth";
import Hits from "@/components/Hits/Hits";

// Этот блок собирает страницу "О нас" из общих компонентов сайта.
export default function AboutPage() {
  return (
    <>
      {/* Этот блок показывает верхнюю навигацию сайта. */}
      <Navigation />
      {/* Этот блок содержит основное содержимое страницы "О нас". */}
      <main id="main">
        {/* Этот блок показывает историю и атмосферу кофейни. */}
        <About />
        {/* Этот блок показывает причины выбрать кофейню BENO. */}
        <Features />
        {/* Этот блок показывает авторскую новинку месяца. */}
        <NewMonth />
        {/* Этот блок показывает самые популярные позиции кофейни. */}
        <Hits />
      </main>
      {/* Этот блок показывает подвал с контактами и служебными ссылками. */}
      <Footer />
    </>
  );
}
