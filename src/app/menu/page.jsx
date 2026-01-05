/*
 Этот файл определяет страницу полного меню.
 Он показывает карточки меню, подтянутые с серверного эндпоинта.
 Человек может посмотреть меню и выбрать интересующие позиции.
*/
import { headers } from "next/headers";
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer/Footer";
import MenuPage from "@/components/MenuPage/MenuPage";

// Этот блок загружает данные меню с серверного эндпоинта.
async function fetchMenuItems() {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/menu-with-variants`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return data;
  }
  return Array.isArray(data?.results) ? data.results : [];
}

// Этот блок собирает страницу меню из общих компонентов.
export default async function Menu() {
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
