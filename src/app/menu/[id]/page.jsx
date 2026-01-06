/*
 Этот файл определяет страницу одной позиции меню.
 Он показывает подробную информацию о выбранной позиции.
 Человек может посмотреть детали и вернуться обратно к меню.
*/
import { headers } from "next/headers";
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer/Footer";
import MenuItemPage from "@/components/MenuItemPage/MenuItemPage";

// Этот блок загружает список меню и находит нужную позицию по id.
async function fetchMenuItem(itemId) {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/menu-with-variants`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
    ? data.results
    : [];
  const targetId = String(itemId ?? "");

  return items.find((item) => String(item?.id) === targetId) ?? null;
}

// Этот блок собирает страницу одной позиции из общих компонентов.
export default async function MenuItem({ params }) {
  // Этот блок безопасно получает параметры маршрута.
  const resolvedParams = await params;
  const item = await fetchMenuItem(resolvedParams?.id);

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
