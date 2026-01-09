/*
 Этот файл определяет страницу одной позиции меню.
 Он показывает подробную информацию о выбранной позиции.
 Человек может посмотреть детали и вернуться обратно к меню.
*/
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer/Footer";
import MenuItemPage from "@/components/MenuItemPage/MenuItemPage";
import { fetchMenuItemById } from "@/lib/menuApi";

// Этот тип описывает ожидаемые параметры маршрута для страницы позиции.
type MenuItemRouteProps = {
  params: Promise<{ id?: string | null }>;
};

// Этот блок собирает страницу одной позиции из общих компонентов.
export default async function MenuItem({ params }: MenuItemRouteProps) {
  // Этот блок получает параметры маршрута, когда они готовы.
  const resolvedParams = await params;
  // Этот блок загружает данные позиции по ее идентификатору.
  const itemId = resolvedParams?.id ?? null;
  const item = await fetchMenuItemById(itemId);

  return (
    <>
      <Navigation />
      <main id="main">
        {/* Этот блок показывает страницу выбранной позиции. */}
        <MenuItemPage item={item} />
      </main>
      <Footer />
    </>
  );
}
