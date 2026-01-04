/*
 Этот файл проверяет компонент NewMonth.
 Он подтверждает, что секция новинки месяца отображает заголовок, карточку и ссылки.
 Человек напрямую с тестами не взаимодействует, они только фиксируют ожидаемое поведение.
*/
import { render, screen } from "@testing-library/react";
import NewMonth from "./NewMonth";

// Этот блок проверяет отображение секции новинки месяца.
describe("NewMonth", () => {
  // Этот тест убеждается, что секция имеет правильный заголовок и якорь.
  it("показывает заголовок и якорь секции", () => {
    render(<NewMonth />);

    const section = screen.getByRole("region", { name: "Новинка месяца" });

    expect(section).toHaveAttribute("id", "new");
    expect(
      screen.getByRole("heading", { name: "Новинка месяца" })
    ).toBeInTheDocument();
  });

  // Этот тест убеждается, что карточка и ссылка на действие видны.
  it("показывает карточку с напитком и ссылкой", () => {
    render(<NewMonth />);

    expect(screen.getByText("Пряный тыквенный латте")).toBeInTheDocument();
    expect(
      screen.getByText("«Специально к осени — пряный тыквенный латте».")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Посмотреть в меню" })
    ).toHaveAttribute("href", "/menu#seasonal");
  });
});
