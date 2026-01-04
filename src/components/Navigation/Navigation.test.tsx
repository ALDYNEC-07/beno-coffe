/*
 Этот файл проверяет компонент Navigation.
 Он подтверждает, что на экране есть кнопка меню и она открывает навигацию.
 Человек напрямую с тестами не взаимодействует, они только фиксируют ожидаемое поведение.
*/
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navigation from "./Navigation";

// Этот блок проверяет основное поведение кнопки меню.
describe("Navigation", () => {
  // Этот тест имитирует нажатие на кнопку меню и проверяет её состояние.
  it("открывает меню по нажатию", async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const menuButton = screen.getByRole("button", { name: "Меню" });

    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await user.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });
});
