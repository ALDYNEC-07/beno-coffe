/*
 Этот файл определяет страницу одной позиции меню.
 Он показывает подробную информацию о выбранной позиции.
 Человек может посмотреть детали и вернуться обратно к меню.
*/
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer/Footer";
import MenuItemPage from "@/components/MenuItemPage/MenuItemPage";
import { fetchMenuItemById } from "@/lib/menuApi";

// Этот блок собирает страницу одной позиции из общих компонентов.
export default async function MenuItem({ params }) {
  // Этот блок безопасно получает параметры маршрута.
  const resolvedParams = await params;
  // Этот блок загружает данные позиции по ее идентификатору.
  const item = await fetchMenuItemById(resolvedParams?.id);

  // Этот блок возвращает страницу 404, если позиция не найдена.
  if (!item) {
    notFound();
  }

  return (
    <>
      <Navigation />
      <main id="main">
        <MenuItemPage item={item} />
      </main>
      <Footer />
    </>
  );
}
