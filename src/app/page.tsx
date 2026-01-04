/*
 Этот файл определяет главную страницу.
 Он показывает навигацию, первый экран, преимущества, новинку месяца и хиты.
 Человек может перейти по ссылкам в навигации и в ключевых секциях.
*/
import Hero from "@/components/Hero/Hero";
import Features from "@/components/Features/Features";
import NewMonth from "@/components/NewMonth/NewMonth";
import Hits from "@/components/Hits/Hits";
import Navigation from "@/components/Navigation/Navigation";

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
        {/* Этот блок показывает секцию ключевых преимуществ. */}
        <Features />
        {/* Этот блок показывает секцию новинки месяца. */}
        <NewMonth />
        {/* Этот блок показывает секцию с самыми популярными позициями. */}
        <Hits />
      </main>
    </>
  );
}
