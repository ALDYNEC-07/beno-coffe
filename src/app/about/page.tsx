/*
 Этот файл определяет страницу "О нас".
 Он показывает историю кофейни и фото команды.
 Человек может познакомиться с атмосферой и узнать больше о BENO.
*/
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer/Footer";
import About from "@/components/About/About";

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
      </main>
      {/* Этот блок показывает подвал с контактами и служебными ссылками. */}
      <Footer />
    </>
  );
}
