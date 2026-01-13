/*
 Этот файл определяет главную страницу.
 Он показывает навигацию, первый экран и полное меню.
 Человек может перейти по ссылкам в навигации и посмотреть меню на месте.
*/
import Hero from "@/components/Hero/Hero";
import MenuPage from "@/components/MenuPage/MenuPage";
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer/Footer";
import { fetchMenuItems } from "@/lib/menuApi";
import { Suspense } from "react";

// Этот блок собирает основные части главной страницы.
export default async function Home() {
  // Этот блок загружает список меню для главной страницы.
  const items = await fetchMenuItems();

  return (
    <>
      {/* Этот блок показывает верхнюю навигацию сайта. */}
      <Navigation />
      {/* Этот блок содержит основное содержимое главной страницы. */}
      <main id="main">
        {/* Этот блок показывает главный приветственный экран. */}
        <Hero />
        {/* Этот блок показывает полное меню прямо на главной странице и ждёт готовности адресной строки. */}
        <Suspense fallback={<p>Загружаем меню...</p>}>
          <MenuPage items={items} />
        </Suspense>
      </main>
      {/* Этот блок показывает подвал с контактами и служебными ссылками. */}
      <Footer />
    </>
  );
}
