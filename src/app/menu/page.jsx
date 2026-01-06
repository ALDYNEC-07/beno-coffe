/*
 Этот файл определяет страницу полного меню.
 Он показывает карточки меню, подтянутые с серверного эндпоинта.
 Человек может посмотреть меню и выбрать интересующие позиции.
*/
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer/Footer";
import MenuPage from "@/components/MenuPage/MenuPage";
import { fetchMenuItems } from "@/lib/menuApi";

// Этот блок собирает страницу меню из общих компонентов.
export default async function Menu() {
  // Этот блок загружает список меню с серверного эндпоинта.
  const items = await fetchMenuItems();

  return (
    <>
      <Navigation />
      <main id="main">
        <MenuPage items={items} />
      </main>
      <Footer />
    </>
  );
}
