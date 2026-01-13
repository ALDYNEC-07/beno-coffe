/*
 Этот файл определяет главную страницу.
 Он показывает навигацию, первый экран и хиты.
 Человек может перейти по ссылкам в навигации и в ключевых секциях.
*/
import Hero from "@/components/Hero/Hero";
import Hits from "@/components/Hits/Hits";
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer/Footer";

// Этот блок собирает основные части главной страницы.
export default function Home() {
  return (
    <>
      {/* Этот блок показывает верхнюю навигацию сайта. */}
      <Navigation />
      {/* Этот блок содержит основное содержимое главной страницы. */}
      <main id="main">
        {/* Этот блок показывает главный приветственный экран. */}
        <Hero />
        {/* Этот блок показывает секцию с самыми популярными позициями. */}
        <Hits />
      </main>
      {/* Этот блок показывает подвал с контактами и служебными ссылками. */}
      <Footer />
    </>
  );
}
